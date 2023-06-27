import { initContract } from './utils/initContract';
import { onSubscriptionCreated } from './utils/onSubscriptionCreated';
import { onSubscriptionUpdated } from './utils/onSubscriptionUpdated';
import { onSubscriptionDeleted } from './utils/onSubscriptionDeleted';
import { onSubscriptionInstanceCreated } from './utils/onSubscriptionInstanceCreated';
import { onSubscriptionInstanceUpdated } from './utils/onSubscriptionInstanceUpdated';
import { onSubscriptionInstanceDeleted } from './utils/onSubscriptionInstanceDeleted';

const main = async () => {
	const contract = await initContract();
	await onSubscriptionCreated(contract);
	await onSubscriptionUpdated(contract);
	await onSubscriptionDeleted(contract);
	await onSubscriptionInstanceCreated(contract);
	await onSubscriptionInstanceUpdated(contract);
	await onSubscriptionInstanceDeleted(contract);
};

main().catch((err) => {
	if (err instanceof Error) {
		throw Error(err.message);
	}

	throw new Error(err);
});
