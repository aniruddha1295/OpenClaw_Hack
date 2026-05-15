// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AlkahestEscrow
 * @dev A custom escrow implementation matching the backend's expected ABI.
 * Used for holding funds trustlessly and releasing them upon AI agent approval.
 */
contract AlkahestEscrow {
    struct Escrow {
        uint256 id;
        address payer;
        address payee;
        uint256 amount;
        bool isReleased;
        bool isRefunded;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);

    function createEscrow(address payee, uint256 amount) public payable returns (uint256) {
        require(msg.value == amount, "Sent value must match amount");
        
        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            id: escrowId,
            payer: msg.sender,
            payee: payee,
            amount: amount,
            isReleased: false,
            isRefunded: false
        });

        emit EscrowCreated(escrowId, msg.sender, payee, amount);
        return escrowId;
    }

    function releaseEscrow(uint256 escrowId) public {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.amount > 0, "Escrow does not exist");
        require(!escrow.isReleased, "Already released");
        require(!escrow.isRefunded, "Already refunded");
        // For hackathon, allow the payer (the agent) to release the escrow.
        require(msg.sender == escrow.payer, "Only payer can release");

        escrow.isReleased = true;
        payable(escrow.payee).transfer(escrow.amount);
        
        emit EscrowReleased(escrowId);
    }

    function refundEscrow(uint256 escrowId) public {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.amount > 0, "Escrow does not exist");
        require(!escrow.isReleased, "Already released");
        require(!escrow.isRefunded, "Already refunded");
        require(msg.sender == escrow.payer, "Only payer can refund");

        escrow.isRefunded = true;
        payable(escrow.payer).transfer(escrow.amount);

        emit EscrowRefunded(escrowId);
    }
}
