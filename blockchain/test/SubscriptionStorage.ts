import { ethers } from "hardhat";
import {
    ContractTransactionResponse,
    Signer,
    AbiCoder,
    keccak256,
} from "ethers";
import { expect } from "chai";
import { ERC20Mock, SubscriptionStorage } from "../typechain-types";

async function calculateHashedMsgSender(address: Signer): Promise<string> {
    const msgSender = await address.getAddress();
    const hashedMsgSender = ethers.solidityPackedKeccak256(
        ["address"],
        [msgSender]
    );

    return hashedMsgSender;
}

describe("SubscriptionStorage", function () {
    let SubscriptionStorage: any;
    let subscriptionStorage: any;
    let Erc20Mock: any;
    let erc20Mock: any;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    beforeEach(async function () {
        SubscriptionStorage = await ethers.getContractFactory(
            "SubscriptionStorage"
        );
        Erc20Mock = await ethers.getContractFactory("ERC20Mock");
        [owner, addr1, addr2] = await ethers.getSigners();
        subscriptionStorage = await SubscriptionStorage.deploy(
            owner.getAddress(),
            owner.getAddress()
        );
        await subscriptionStorage.waitForDeployment();
        erc20Mock = await Erc20Mock.deploy("Test Token", "TKN");
        await erc20Mock.waitForDeployment();
    });

    describe("createSubscription", function () {
        it("should emit a SubscriptionCreated event", async function () {
            await expect(
                subscriptionStorage.createSubscription(
                    addr1.getAddress(),
                    erc20Mock.getAddress(),
                    100,
                    200,
                    86401,
                    "Subscription data"
                )
            ).to.emit(subscriptionStorage, "SubscriptionCreated");
        });

        it("should check if the subscription was created", async function () {
            const subId = await calculateHashedMsgSender(addr1);
            const tx = await subscriptionStorage.getSubscription(
                ethers.encodeBytes32String(subId)
            );
            console.log(tx);
        });
    });

    describe("updateSubscription", function () {
        let subscriptionId: string;

        beforeEach(async function () {
            await subscriptionStorage.createSubscription(
                addr1.getAddress(),
                erc20Mock.getAddress(),
                100,
                200,
                86401,
                "Subscription data"
            );

            const ownerAddress = await owner.getAddress();
            subscriptionId = ethers.solidityPackedKeccak256(
                ["address"],
                [ownerAddress]
            );
        });

        it("should emit a SubscriptionUpdated event", async function () {
            await expect(
                subscriptionStorage.updateSubscription(
                    subscriptionId,
                    erc20Mock.getAddress(),
                    addr1.getAddress(),
                    150,
                    300,
                    172801,
                    "Updated subscription data"
                )
            ).to.emit(subscriptionStorage, "SubscriptionUpdated");
        });
    });

    describe("deleteSubscription", function () {
        let subscriptionId: string;

        beforeEach(async function () {
            await subscriptionStorage.createSubscription(
                addr1.getAddress(),
                erc20Mock.getAddress(),
                100,
                200,
                86401,
                "Subscription data"
            );

            const ownerAddress = await owner.getAddress();
            subscriptionId = ethers.solidityPackedKeccak256(
                ["address"],
                [ownerAddress]
            );
        });

        it("should emit a SubscriptionDelted event", async function () {
            await expect(
                subscriptionStorage.deleteSubscription(subscriptionId)
            ).to.emit(subscriptionStorage, "SubscriptionDeleted");
        });
    });

    describe("createSubscriptionInstance", function () {
        let subscriptionId: string;

        beforeEach(async function () {
            const tx = await subscriptionStorage.createSubscription(
                addr1.getAddress(),
                erc20Mock.getAddress(),
                100,
                200,
                86401,
                "Subscription data"
            );

            const txResponse = await tx.wait();

            console.log(txResponse as any);

            const ownerAddress = await owner.getAddress();
            subscriptionId = ethers.solidityPackedKeccak256(
                ["address"],
                [ownerAddress]
            );

            await erc20Mock.mint(addr2.getAddress(), 100000000000);
            await erc20Mock
                .connect(addr2)
                .approve(subscriptionStorage.getAddress(), 100000000000);
        });

        it("should emit a SubscriptionInstanceCreated event", async function () {
            await expect(
                subscriptionStorage
                    .connect(addr2)
                    .createSubscriptionInstance(subscriptionId)
            ).to.emit(subscriptionStorage, "SubscriptionInstanceCreated");
        });
    });

    describe("updateSubscriptionInstance", function () {
        let subscriptionId: string;
        let instanceId: string;

        beforeEach(async function () {
            await subscriptionStorage.createSubscription(
                addr1.getAddress(),
                erc20Mock.getAddress(),
                100,
                200,
                86401,
                "Subscription data"
            );

            const ownerAddress = await owner.getAddress();
            const addr2Address = await addr2.getAddress();

            subscriptionId = ethers.solidityPackedKeccak256(
                ["address"],
                [ownerAddress]
            );
            instanceId = ethers.solidityPackedKeccak256(
                ["address", "bytes32"],
                [addr2Address, subscriptionId]
            );

            await erc20Mock.mint(addr2.getAddress(), 100000000000);
            await erc20Mock
                .connect(addr2)
                .approve(subscriptionStorage.getAddress(), 100000000000);

            await subscriptionStorage
                .connect(addr2)
                .createSubscriptionInstance(subscriptionId);
        });

        it("should emit a SubscriptionInstanceUpdated event", async function () {
            await expect(
                subscriptionStorage.updateSubscriptionInstance(
                    instanceId,
                    subscriptionId,
                    0,
                    10,
                    "SAFSAFAS"
                )
            ).to.emit(subscriptionStorage, "SubscriptionInstanceUpdated");
        });
    });

    describe("deleteSubscriptionInstance", function () {
        let subscriptionId: string;
        let instanceId: string;

        beforeEach(async function () {
            await subscriptionStorage.createSubscription(
                addr1.getAddress(),
                erc20Mock.getAddress(),
                100,
                200,
                86401,
                "Subscription data"
            );

            const ownerAddress = await owner.getAddress();
            const addr2Address = await addr2.getAddress();

            subscriptionId = ethers.solidityPackedKeccak256(
                ["address"],
                [ownerAddress]
            );
            instanceId = ethers.solidityPackedKeccak256(
                ["address", "string"],
                [addr2Address, subscriptionId]
            );

            await erc20Mock.mint(addr2.getAddress(), 100000000000);
            await erc20Mock
                .connect(addr2)
                .approve(subscriptionStorage.getAddress(), 100000000000);
        });

        it("should emit a SubscriptionInstanceCreated event", async function () {
            await subscriptionStorage
                .connect(addr2)
                .createSubscriptionInstance(subscriptionId);
        });

        it("should emit a SubscriptionInstanceDeleted event", async function () {
            const subscriptionInstanceId =
                await subscriptionStorage.getSubscriptionInstanceByUser(
                    subscriptionId,
                    addr2.getAddress()
                );
            await expect(
                subscriptionStorage.deleteSubscriptionInstance(
                    instanceId,
                    subscriptionId
                )
            ).to.emit(subscriptionStorage, "SubscriptionInstanceDeleted");
        });
    });
});
