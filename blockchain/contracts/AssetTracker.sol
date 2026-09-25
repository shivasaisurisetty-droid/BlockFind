// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssetTracker
 * @dev BlockFind Decentralized Asset Provenance & Ownership Verification Smart Contract
 * Solves asset fraud, counterfeit claims, and enables verifiable on-chain ownership transfers.
 */
contract AssetTracker {
    enum AssetStatus { REGISTERED, LOST, FOUND, CLAIM_PENDING, VERIFIED, RETURNED }

    struct OwnershipRecord {
        address previousOwner;
        address newOwner;
        uint256 timestamp;
        string transferReason;
        string claimId;
    }

    struct Asset {
        string assetId;
        string serialHash;      // SHA-256 hash of hardware serial/IMEI (never plaintext)
        string metadataURI;     // IPFS / Cloud metadata pointer
        address currentOwner;
        AssetStatus status;
        uint256 registrationTime;
        bool isRegistered;
    }

    address public admin;
    mapping(address => bool) public authorizedVerifiers;
    mapping(string => Asset) private assets;
    mapping(string => OwnershipRecord[]) private assetOwnershipHistory;
    
    string[] public registeredAssetIds;

    // Events
    event AssetRegistered(string indexed assetId, address indexed owner, string serialHash, uint256 timestamp);
    event StatusChanged(string indexed assetId, AssetStatus newStatus, uint256 timestamp);
    event ClaimSubmitted(string indexed assetId, string claimId, address indexed claimant, uint256 timestamp);
    event OwnershipTransferred(string indexed assetId, address indexed fromOwner, address indexed toOwner, string claimId, uint256 timestamp);
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);

    modifier onlyAdmin() {
        require(msg.sender == admin, "BlockFind: Caller is not system admin");
        _;
    }

    modifier onlyAuthorizedVerifier() {
        require(msg.sender == admin || authorizedVerifiers[msg.sender], "BlockFind: Caller is not authorized verifier");
        _;
    }

    modifier onlyAssetOwner(string memory _assetId) {
        require(assets[_assetId].isRegistered, "BlockFind: Asset does not exist");
        require(assets[_assetId].currentOwner == msg.sender, "BlockFind: Caller is not asset owner");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }

    /**
     * @dev Authorize a trusted verifier (e.g. Campus Security Cell)
     */
    function authorizeVerifier(address _verifier) external onlyAdmin {
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }

    function revokeVerifier(address _verifier) external onlyAdmin {
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier);
    }

    /**
     * @dev Register a new physical asset onto the immutable ledger
     */
    function registerAsset(
        string memory _assetId,
        string memory _serialHash,
        string memory _metadataURI
    ) external {
        require(!assets[_assetId].isRegistered, "BlockFind: Asset ID already registered");
        require(bytes(_assetId).length > 0, "BlockFind: Invalid asset ID");

        assets[_assetId] = Asset({
            assetId: _assetId,
            serialHash: _serialHash,
            metadataURI: _metadataURI,
            currentOwner: msg.sender,
            status: AssetStatus.REGISTERED,
            registrationTime: block.timestamp,
            isRegistered: true
        });

        registeredAssetIds.push(_assetId);

        // Record genesis ownership
        assetOwnershipHistory[_assetId].push(OwnershipRecord({
            previousOwner: address(0),
            newOwner: msg.sender,
            timestamp: block.timestamp,
            transferReason: "Genesis Registration",
            claimId: ""
        }));

        emit AssetRegistered(_assetId, msg.sender, _serialHash, block.timestamp);
    }

    /**
     * @dev Update status of an asset (e.g. mark as LOST or FOUND)
     */
    function updateStatus(string memory _assetId, AssetStatus _newStatus) external {
        require(assets[_assetId].isRegistered, "BlockFind: Asset not found");
        require(
            msg.sender == assets[_assetId].currentOwner || authorizedVerifiers[msg.sender],
            "BlockFind: Unauthorized to update status"
        );

        assets[_assetId].status = _newStatus;
        emit StatusChanged(_assetId, _newStatus, block.timestamp);
    }

    /**
     * @dev Verify ownership proof and execute atomic transfer of ownership to claimant
     */
    function verifyAndTransferOwnership(
        string memory _assetId,
        address _newOwner,
        string memory _claimId,
        string memory _verificationRemarks
    ) external onlyAuthorizedVerifier {
        require(assets[_assetId].isRegistered, "BlockFind: Asset not found");
        require(_newOwner != address(0), "BlockFind: Invalid new owner address");

        address previousOwner = assets[_assetId].currentOwner;
        assets[_assetId].currentOwner = _newOwner;
        assets[_assetId].status = AssetStatus.VERIFIED;

        assetOwnershipHistory[_assetId].push(OwnershipRecord({
            previousOwner: previousOwner,
            newOwner: _newOwner,
            timestamp: block.timestamp,
            transferReason: _verificationRemarks,
            claimId: _claimId
        }));

        emit OwnershipTransferred(_assetId, previousOwner, _newOwner, _claimId, block.timestamp);
    }

    /**
     * @dev Retrieve asset details
     */
    function getAsset(string memory _assetId) external view returns (
        string memory assetId,
        string memory serialHash,
        string memory metadataURI,
        address currentOwner,
        AssetStatus status,
        uint256 registrationTime
    ) {
        require(assets[_assetId].isRegistered, "BlockFind: Asset not found");
        Asset memory a = assets[_assetId];
        return (a.assetId, a.serialHash, a.metadataURI, a.currentOwner, a.status, a.registrationTime);
    }

    /**
     * @dev Retrieve complete immutable ownership history
     */
    function getOwnershipHistory(string memory _assetId) external view returns (OwnershipRecord[] memory) {
        require(assets[_assetId].isRegistered, "BlockFind: Asset not found");
        return assetOwnershipHistory[_assetId];
    }

    /**
     * @dev Get total number of registered assets on blockchain
     */
    function getTotalRegisteredAssets() external view returns (uint256) {
        return registeredAssetIds.length;
    }
}
