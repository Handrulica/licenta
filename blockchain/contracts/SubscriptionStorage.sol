// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./UnorderedKeySet.sol";

contract SubscriptionStorage is AccessControl {
    using UnorderedKeySetLib for UnorderedKeySetLib.Set;
    using SafeMath for uint;

    address public VaultAddress;

    bytes32 public constant SUBSCRIPTION_OPERATOR_ROLE =
        keccak256("SUBSCRIPTION_OPERATOR_ROLE");

    constructor(address _vaultAddress, address _subscriptionManagerAddress) {
        VaultAddress = _vaultAddress;
        _grantRole(SUBSCRIPTION_OPERATOR_ROLE, _subscriptionManagerAddress);
    }

    enum SubscriptionStatus {
        ACTIVE,
        INACTIVE
    }

    event SubscriptionCreated(
        address caller,
        bytes32 subscriptionId,
        address owner,
        address vaultAddress,
        address tokenAddress,
        uint256 recurringAmount,
        uint256 initialAmount,
        uint256 period,
        string data
    );

    event SubscriptionUpdated(
        address caller,
        bytes32 subscriptionId,
        address owner,
        address vaultAddress,
        address tokenAddress,
        uint256 recurringAmount,
        uint256 initialAmount,
        uint256 period,
        string data
    );

    event SubscriptionDeleted(address caller, bytes32 subscriptionId);

    event SubscriptionInstanceCreated(
        address caller,
        bytes32 subscriptionInstanceId,
        bytes32 subscriptionId,
        address owner,
        uint256 nextPayment,
        SubscriptionStatus status,
        uint256 discount,
        string data
    );

    event SubscriptionInstanceUpdated(
        address caller,
        bytes32 subscriptionInstanceId,
        bytes32 subscriptionId,
        address owner,
        uint256 nextPaymentPeriod,
        SubscriptionStatus status,
        uint256 discount,
        string data
    );

    event SubscriptionInstanceDeleted(
        address caller,
        bytes32 subscriptionInstanceId
    );

    event PaymentProcessed(
        bytes32 subscriptionInstanceId,
        bytes32 subscriptionId,
        uint256 nextPaymentPeriod
    );

    event SubscriptionDeactived(
        bytes32 subscriptionInstanceId,
        bytes32 subscriptionId
    );

    event SubscriptionReactivated(
        bytes32 subscriptionInstanceId,
        bytes32 subscriptionId
    );

    struct SubscriptionInstance {
        address owner;
        uint256 discount;
        string data;
        uint256 nextPaymentPeriod;
        SubscriptionStatus status;
    }

    struct Subscription {
        address owner;
        address vaultAddress;
        address tokenAddress;
        uint256 recurringAmount;
        uint256 initialAmount;
        uint256 period;
        string data;
        UnorderedKeySetLib.Set subscriptionInstancesSet;
        mapping(bytes32 => SubscriptionInstance) subscriptionInstances;
    }

    UnorderedKeySetLib.Set subscriptionsSet;
    mapping(bytes32 => Subscription) subscriptions;

    function createSubscription(
        address _vaultAddress,
        address _tokenAddress,
        uint256 _recurringAmount,
        uint256 _initialAmount,
        uint256 _period,
        string memory _data
    ) public returns (bytes32) {
        // Checking if the subscription period is longer than 1 day (in seconds)
        require(
            (_period > 86400),
            "The minimum period for a subscription is 1 day"
        );

        require(
            (_vaultAddress != address(0)),
            "Vault address cannot be address 0x0"
        );

        require(
            (_tokenAddress != address(0)),
            "Token address cannot be address 0x0"
        );

        // Generating an unique ID for subscription based on the address of the sender and the block timestamp
        bytes32 subscriptionId = keccak256(abi.encodePacked(_msgSender()));

        // Inserting the new subcription's id into the set
        subscriptionsSet.insert(subscriptionId);

        // Inserting the new subscription's data into the subscriptions map
        Subscription storage newSubscription = subscriptions[subscriptionId];
        newSubscription.owner = _msgSender();
        newSubscription.vaultAddress = _vaultAddress;
        newSubscription.tokenAddress = _tokenAddress;
        newSubscription.recurringAmount = _recurringAmount;
        newSubscription.initialAmount = _initialAmount;
        newSubscription.period = _period;
        newSubscription.data = _data;

        emit SubscriptionCreated(
            _msgSender(),
            subscriptionId,
            _msgSender(),
            _vaultAddress,
            _tokenAddress,
            _recurringAmount,
            _initialAmount,
            _period,
            _data
        );

        return subscriptionId;
    }

    function getSubscription(
        bytes32 _subscriptionId
    )
        public
        view
        returns (
            address owner,
            address vaultAddress,
            address tokenAddress,
            uint256 recurringAmount,
            uint256 initialAmount,
            uint256 period,
            string memory data
        )
    {
        require(
            subscriptionsSet.exists(_subscriptionId),
            "Can't get a subscription that doesn't exist"
        );

        Subscription storage currentSubscription = subscriptions[
            _subscriptionId
        ];

        return (
            currentSubscription.owner,
            currentSubscription.vaultAddress,
            currentSubscription.tokenAddress,
            currentSubscription.recurringAmount,
            currentSubscription.initialAmount,
            currentSubscription.period,
            currentSubscription.data
        );
    }

    function updateSubscription(
        bytes32 _subscriptionId,
        address _vaultAddress,
        address _tokenAddress,
        uint256 _recurringAmount,
        uint256 _initialAmount,
        uint256 _period,
        string memory _data
    ) public {
        require(
            subscriptions[_subscriptionId].owner == _msgSender(),
            "Only the owner of the subscription can update it"
        );

        require(
            subscriptionsSet.exists(_subscriptionId),
            "Can't update a subscription that doesn't exist"
        );

        // Checking if the subscription period is longer than 1 day (in seconds)
        require(
            (_period > 86400),
            "The minimum period for a subscription is 1 day"
        );

        require(
            (_vaultAddress != address(0)),
            "Vault address cannot be address 0x0"
        );

        require(
            (_tokenAddress != address(0)),
            "Token address cannot be address 0x0"
        );

        // Updating the subscription's data
        Subscription storage newSubscription = subscriptions[_subscriptionId];
        newSubscription.owner = _msgSender();
        newSubscription.vaultAddress = _vaultAddress;
        newSubscription.tokenAddress = _tokenAddress;
        newSubscription.recurringAmount = _recurringAmount;
        newSubscription.initialAmount = _initialAmount;
        newSubscription.period = _period;
        newSubscription.data = _data;

        emit SubscriptionUpdated(
            _msgSender(),
            _subscriptionId,
            _msgSender(),
            _vaultAddress,
            _tokenAddress,
            _recurringAmount,
            _initialAmount,
            _period,
            _data
        );
    }

    function deleteSubscription(bytes32 _subscriptionId) public {
        require(
            ((subscriptions[_subscriptionId].owner == _msgSender()) ||
                hasRole(SUBSCRIPTION_OPERATOR_ROLE, _msgSender())),
            "Only the owner or the operator of the subscription can update it"
        );
        subscriptionsSet.remove(_subscriptionId);
        delete subscriptions[_subscriptionId];
        emit SubscriptionDeleted(_msgSender(), _subscriptionId);
    }

    function createSubscriptionInstance(
        bytes32 _subscriptionId
    ) public returns (bytes32) {
        require(
            (subscriptionsSet.exists(_subscriptionId)),
            "Can't create an instance for a subscription that doesn't exist"
        );

        Subscription storage currentSubscription = subscriptions[
            _subscriptionId
        ];

        // Generating an unique ID for subscription based on the address of the sender and the block timestamp
        bytes32 subscriptionInstanceId = keccak256(
            abi.encodePacked(_msgSender(), _subscriptionId)
        );

        require(
            currentSubscription.subscriptionInstancesSet.exists(
                subscriptionInstanceId
            ) == false,
            "Can't create an instance that already exists"
        );

        // Calculating the required amount for the subscription initial payment
        uint256 requiredAmount = currentSubscription.initialAmount.add(
            currentSubscription.recurringAmount
        );

        IERC20 subscriptionToken = IERC20(currentSubscription.tokenAddress);

        // Calculating the transfer tax
        uint256 taxAmount = requiredAmount.mul(3).div(100);

        // Checking if the payer has enough balance
        require(
            (subscriptionToken.balanceOf(_msgSender()) >= requiredAmount),
            "Insufficient balance!"
        );

        // Checking if the payer has allowed the contract to use the required amount
        require(
            (subscriptionToken.allowance(_msgSender(), address(this)) >=
                requiredAmount),
            "Insufficient allowance!"
        );

        // Making initial payment
        subscriptionToken.transferFrom(
            _msgSender(),
            currentSubscription.vaultAddress,
            requiredAmount.sub(taxAmount)
        );

        // Taking the tax
        subscriptionToken.transferFrom(_msgSender(), VaultAddress, taxAmount);

        currentSubscription.subscriptionInstancesSet.insert(
            subscriptionInstanceId
        );

        // Inserting the new subscription instance's data
        SubscriptionInstance
            storage newSubscriptionInstance = currentSubscription
                .subscriptionInstances[subscriptionInstanceId];

        newSubscriptionInstance.owner = _msgSender();
        newSubscriptionInstance.discount = 0;
        newSubscriptionInstance.status = SubscriptionStatus.ACTIVE;
        newSubscriptionInstance.nextPaymentPeriod = block.timestamp.add(
            currentSubscription.period
        );

        emit PaymentProcessed(
            subscriptionInstanceId,
            _subscriptionId,
            newSubscriptionInstance.nextPaymentPeriod
        );

        emit SubscriptionInstanceCreated(
            _msgSender(),
            subscriptionInstanceId,
            _subscriptionId,
            _msgSender(),
            newSubscriptionInstance.nextPaymentPeriod,
            newSubscriptionInstance.status,
            newSubscriptionInstance.discount,
            newSubscriptionInstance.data
        );

        return subscriptionInstanceId;
    }

    function getSubscriptionInstanceByUser(
        bytes32 _subscriptionId,
        address _user
    ) public view returns (bytes32) {
        require(
            (subscriptionsSet.exists(_subscriptionId)),
            "Can't get an instance for a subscription that doesn't exist"
        );

        Subscription storage currentSubscription = subscriptions[
            _subscriptionId
        ];

        // Generating an unique ID for subscription based on the address of the sender and the block timestamp
        bytes32 subscriptionInstanceId = keccak256(
            abi.encodePacked(_user, _subscriptionId)
        );

        require(
            currentSubscription.subscriptionInstancesSet.exists(
                subscriptionInstanceId
            ) == true,
            "Can't get an instance that doesn't exist"
        );

        return subscriptionInstanceId;
    }

    function getSubscriptionInstance(
        bytes32 _subscriptionId,
        bytes32 _subscriptionInstanceId
    )
        public
        view
        returns (
            address owner,
            uint256 discount,
            string memory data,
            uint256 nextPaymentPeriod,
            SubscriptionStatus status
        )
    {
        require(
            subscriptionsSet.exists(_subscriptionId),
            "Can't get an instance for a subscription that doesn't exist"
        );

        require(
            subscriptions[_subscriptionId].subscriptionInstancesSet.exists(
                _subscriptionInstanceId
            ),
            "Can't get a subscription that doesn't exist"
        );

        SubscriptionInstance
            storage currentSubscriptionInstance = subscriptions[_subscriptionId]
                .subscriptionInstances[_subscriptionInstanceId];

        return (
            currentSubscriptionInstance.owner,
            currentSubscriptionInstance.discount,
            currentSubscriptionInstance.data,
            currentSubscriptionInstance.nextPaymentPeriod,
            currentSubscriptionInstance.status
        );
    }

    function updateSubscriptionInstance(
        bytes32 _subscriptionInstanceId,
        bytes32 _subscriptionId,
        SubscriptionStatus _status,
        uint256 _discount,
        string memory _data
    ) public {
        require(
            (subscriptions[_subscriptionId].owner == _msgSender()),
            "Only the owner or the operator of the subscription can update it"
        );

        require(
            (
                subscriptions[_subscriptionId].subscriptionInstancesSet.exists(
                    _subscriptionInstanceId
                )
            ),
            "Can't update a subscription instance that doesn't exist"
        );

        SubscriptionInstance storage subscriptionInstance = subscriptions[
            _subscriptionInstanceId
        ].subscriptionInstances[_subscriptionInstanceId];

        // Updating the subscription instance's data
        subscriptionInstance.status = _status;
        subscriptionInstance.discount = _discount;
        subscriptionInstance.data = _data;

        emit SubscriptionInstanceUpdated(
            _msgSender(),
            _subscriptionInstanceId,
            _subscriptionId,
            _msgSender(),
            subscriptionInstance.nextPaymentPeriod,
            subscriptionInstance.status,
            subscriptionInstance.discount,
            subscriptionInstance.data
        );
    }

    function deleteSubscriptionInstance(
        bytes32 _subscriptionId,
        bytes32 _subscriptionInstanceId
    ) public {
        require(
            ((subscriptions[_subscriptionId].owner == _msgSender()) ||
                hasRole(SUBSCRIPTION_OPERATOR_ROLE, _msgSender())),
            "Only the owner or the operator of the subscription can delete it"
        );

        require(
            subscriptionsSet.exists(_subscriptionId),
            "Can't delete instance for a subscription that doesn't exist"
        );

        Subscription storage currentSubscription = subscriptions[
            _subscriptionId
        ];

        currentSubscription.subscriptionInstancesSet.remove(
            _subscriptionInstanceId
        );

        delete currentSubscription.subscriptionInstances[
            _subscriptionInstanceId
        ];

        emit SubscriptionInstanceDeleted(_msgSender(), _subscriptionInstanceId);
    }

    function handleSubscriptionInstacePayment(
        bytes32 _subscriptionId,
        bytes32 _subscriptionInstanceId
    ) public returns (bool) {
        require(
            subscriptionsSet.exists(_subscriptionId),
            "Can't handle the payment for a subscription that doesn't exist"
        );

        require(
            subscriptions[_subscriptionId].subscriptionInstancesSet.exists(
                _subscriptionInstanceId
            ),
            "Can't handle the payment for a subscription instance that doesn't exist"
        );

        Subscription storage currentSubscription = subscriptions[
            _subscriptionId
        ];

        SubscriptionInstance
            storage currentSubscriptionInstance = subscriptions[_subscriptionId]
                .subscriptionInstances[_subscriptionInstanceId];

        require(
            block.timestamp >= currentSubscriptionInstance.nextPaymentPeriod,
            "Can't handle the payment yet"
        );

        uint256 requiredAmount = currentSubscription.recurringAmount.sub(
            currentSubscriptionInstance.discount
        );
        uint256 taxAmount = requiredAmount.mul(3).div(100);

        IERC20 subscriptionToken = IERC20(currentSubscription.tokenAddress);

        // Checking if the payer has enough balance
        require(
            (subscriptionToken.balanceOf(currentSubscriptionInstance.owner) >=
                requiredAmount),
            "Insufficient balance!"
        );

        // Checking if the payer has allowed the contract to use the required amount
        require(
            (subscriptionToken.allowance(
                currentSubscriptionInstance.owner,
                address(this)
            ) >= requiredAmount),
            "Insufficient allowance!"
        );

        // Making initial payment
        bool paymentProcessed = subscriptionToken.transferFrom(
            _msgSender(),
            currentSubscription.vaultAddress,
            requiredAmount.sub(taxAmount)
        );

        // Taking the tax
        bool taxProcessed = subscriptionToken.transferFrom(
            _msgSender(),
            VaultAddress,
            taxAmount
        );

        // If both payments went trough, update the date for the next payment
        if (paymentProcessed && taxProcessed) {
            currentSubscriptionInstance.nextPaymentPeriod = block.timestamp.add(
                currentSubscription.period
            );
            emit PaymentProcessed(
                _subscriptionInstanceId,
                _subscriptionId,
                currentSubscriptionInstance.nextPaymentPeriod
            );
            return true;
        } else {
            // If not, update the subscription status
            currentSubscriptionInstance.status = SubscriptionStatus.INACTIVE;
            emit SubscriptionDeactived(
                _subscriptionInstanceId,
                _subscriptionId
            );
        }
        return false;
    }

    function reactivateSubscriptionPayment(
        bytes32 _subscriptionId,
        bytes32 _subscriptionInstanceId
    ) public {
        require(
            (subscriptions[_subscriptionId].owner == _msgSender() ||
                hasRole(SUBSCRIPTION_OPERATOR_ROLE, _msgSender())),
            "Only the subscription operator or subscription owner can reactivate the subscription!"
        );

        bool paymentSucceded = handleSubscriptionInstacePayment(
            _subscriptionId,
            _subscriptionInstanceId
        );

        if (paymentSucceded) {
            SubscriptionInstance
                storage currentSubscriptionInstance = subscriptions[
                    _subscriptionId
                ].subscriptionInstances[_subscriptionInstanceId];
            currentSubscriptionInstance.status = SubscriptionStatus.ACTIVE;
            emit SubscriptionReactivated(
                _subscriptionInstanceId,
                _subscriptionId
            );
        }
    }
}
