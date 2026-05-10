// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ClaimRegistry} from "../src/ClaimRegistry.sol";

contract DeployClaimRegistry is Script {
    function run() external returns (ClaimRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ClaimRegistry registry = new ClaimRegistry();

        console.log("ClaimRegistry deployed at:", address(registry));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Network chain ID:", block.chainid);

        vm.stopBroadcast();

        return registry;
    }
}
