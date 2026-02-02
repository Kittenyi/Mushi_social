// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MushiRegistry.sol";

contract DeployMushiRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory version = vm.envOr("MUSHI_VERSION", string("1.0.0"));
        string memory appURI = vm.envOr("MUSHI_APP_URI", string("https://mushi.social"));

        vm.startBroadcast(deployerPrivateKey);
        MushiRegistry registry = new MushiRegistry(version, appURI);
        vm.stopBroadcast();

        console.log("MushiRegistry deployed at:", address(registry));
        console.log("Version:", version);
        console.log("AppURI:", appURI);
    }
}
