// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library UnorderedKeySetLib {
    error UnorderedKeySet100KeyCannotBe0x0();
    error UnorderedKeySet101KeyAlreadyExistsInSet();
    error UnorderedKeySet102KeyDoesNotExistInSet();

    struct Set {
        mapping(bytes32 => uint) keyPointers;
        bytes32[] keyList;
    }

    function insert(Set storage self, bytes32 key) internal {
        if (key == 0x0) {
            revert UnorderedKeySet100KeyCannotBe0x0();
        }
        if (exists(self, key)) {
            revert UnorderedKeySet101KeyAlreadyExistsInSet();
        }
        self.keyList.push(key);
        self.keyPointers[key] = self.keyList.length - 1;
    }

    function remove(Set storage self, bytes32 key) internal {
        if (!exists(self, key)) {
            revert UnorderedKeySet102KeyDoesNotExistInSet();
        }
        bytes32 keyToMove = self.keyList[count(self) - 1];
        uint rowToReplace = self.keyPointers[key];
        self.keyPointers[keyToMove] = rowToReplace;
        self.keyList[rowToReplace] = keyToMove;
        delete self.keyPointers[key];
        self.keyList.pop();
    }

    function count(Set storage self) internal view returns (uint) {
        return (self.keyList.length);
    }

    function exists(
        Set storage self,
        bytes32 key
    ) internal view returns (bool) {
        if (self.keyList.length == 0) return false;
        return self.keyList[self.keyPointers[key]] == key;
    }

    function keyAtIndex(
        Set storage self,
        uint index
    ) internal view returns (bytes32) {
        return self.keyList[index];
    }

    function nukeSet(Set storage self) public {
        delete self.keyList;
    }
}
