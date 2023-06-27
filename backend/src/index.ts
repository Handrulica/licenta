import { initContract } from './utils/initContract';
import { onSubscriptionCreated } from './utils/onSubscriptionCreated';
import { onSubscriptionUpdated } from './utils/onSubscriptionUpdated';
import { onSubscriptionDeleted } from './utils/onSubscriptionDeleted';
import { onSubscriptionInstanceCreated } from './utils/onSubscriptionInstanceCreated';
import { onSubscriptionInstanceUpdated } from './utils/onSubscriptionInstanceUpdated';
import { onSubscriptionInstanceDeleted } from './utils/onSubscriptionInstanceDeleted';
import { onPaymentProcessed } from './utils/onPaymentProcessed';
import { onSubscriptionInstanceDeactivated } from './utils/onSubscriptionInstanceDeactivated';
import { onSubscriptionInstanceReactivated } from './utils/onSubscriptionInstanceReacivated';
import { handlePayments } from './utils/paymentsCron';

const main = async () => {
	const contract = await initContract();
	await handlePayments(contract);
	await onPaymentProcessed(contract);
	await onSubscriptionCreated(contract);
	await onSubscriptionUpdated(contract);
	await onSubscriptionDeleted(contract);
	await onSubscriptionInstanceCreated(contract);
	await onSubscriptionInstanceUpdated(contract);
	await onSubscriptionInstanceDeleted(contract);
	await onSubscriptionInstanceDeactivated(contract);
	await onSubscriptionInstanceReactivated(contract);
};

main().catch((err) => {
	if (err instanceof Error) {
		throw Error(err.message);
	}

	throw new Error(err);
});
