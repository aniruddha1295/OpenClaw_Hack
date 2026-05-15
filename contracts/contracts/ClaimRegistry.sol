// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClaimRegistry {
    struct Claim {
        uint256 id;
        address claimant;
        string filecoinCid;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(uint256 => Claim) public claims;
    uint256 public nextClaimId;

    event ClaimFiled(uint256 indexed id, address indexed claimant, string filecoinCid);
    event ClaimVerified(uint256 indexed id);

    function fileClaim(string memory _filecoinCid) public returns (uint256) {
        uint256 claimId = nextClaimId++;
        
        claims[claimId] = Claim({
            id: claimId,
            claimant: msg.sender,
            filecoinCid: _filecoinCid,
            timestamp: block.timestamp,
            isVerified: false
        });

        emit ClaimFiled(claimId, msg.sender, _filecoinCid);
        return claimId;
    }

    function verifyClaim(uint256 _claimId) public {
        // In a real implementation this might be restricted to an authorized verifier / owner
        Claim storage claimState = claims[_claimId];
        require(claimState.timestamp != 0, "Claim does not exist");
        
        claimState.isVerified = true;
        emit ClaimVerified(_claimId);
    }
}
