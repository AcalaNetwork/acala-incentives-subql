import { AccountId, Balance } from "@acala-network/types/interfaces";
import { SubstrateEvent } from "@subql/types";
import { getAccount, getPayoutRewards } from "../utils/record";
import { ensureBlock, ensureExtrinsic } from "./event";

export const payoutRewards = async (event: SubstrateEvent) => {
  // who, pool_id, reward_currency_type, actual_payout, deduction_amount
  const [account, pool, reward_currency_type, actual_payout, deduction_amount] = event.event.data as unknown as [AccountId, any, Balance, Balance, Balance];

  const blockData = await ensureBlock(event);
  await getAccount(account.toString());

  const historyId = `${blockData.id}-${event.event.index.toString()}`;
  const history = await getPayoutRewards(historyId);

  history.addressId = account.toString();
  history.pool = pool.toString();
  history.rewardCurrencyType = BigInt(reward_currency_type.toString());
  history.actualPayout = BigInt(actual_payout.toString());
  history.deductionAmount = BigInt(deduction_amount.toString());
  history.blockId = blockData.id;

  if (event.extrinsic) {
		const extrinsicData = await ensureExtrinsic(event);
		history.extrinsicId = extrinsicData.id;
		await getAccount(event.extrinsic.extrinsic.signer.toString());

		extrinsicData.section = event.event.section;
		extrinsicData.method = event.event.method;
		extrinsicData.addressId = event.extrinsic.extrinsic.signer.toString();

		await extrinsicData.save();
	}
	await history.save();
}