// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MushiRegistry
 * @notice Minimal registry for Mushi app (version / config pointer). Extend as needed.
 */
contract MushiRegistry {
    address public owner;
    string public version;
    string public appURI;

    event VersionSet(string indexed version);
    event AppURISet(string appURI);

    error OnlyOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(string memory _version, string memory _appURI) {
        owner = msg.sender;
        version = _version;
        appURI = _appURI;
    }

    function setVersion(string calldata _version) external onlyOwner {
        version = _version;
        emit VersionSet(_version);
    }

    function setAppURI(string calldata _appURI) external onlyOwner {
        appURI = _appURI;
        emit AppURISet(_appURI);
    }
}
