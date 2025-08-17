// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BeatChain
 * @notice Farcaster ve Base üzerinde işbirlikçi müzik oluşturma ve NFT olarak mint etme protokolü.
 * PRD v2.0'daki gereksinimleri karşılamak üzere tasarlanmıştır.
 */
contract BeatChain is ERC721 {
    using Counters for Counters.Counter;
    
    // Hem Beat'ler hem de NFT'ler için benzersiz ID'ler oluşturmak üzere sayaçlar.
    Counters.Counter private _beatIdCounter;
    Counters.Counter private _tokenIdCounter;

    // Beat'in durumunu takip etmek için enum yapısı.
    enum Status { InProgress, Completed }

    // Her bir Beat'in on-chain verilerini saklayan yapı.
    struct Beat {
        uint256 id;                 // Beat'in benzersiz ID'si.
        Status status;              // Durumu (InProgress veya Completed).
        address[3] contributors;    // Katkıda bulunan 3 kullanıcının adresi.
        string[3] segmentCIDs;      // Her bir ses segmentinin IPFS CID'si.
        uint8 segmentCount;         // Eklenen segment sayısı (0, 1, 2).
        bool isMinted;              // Bu Beat'in NFT olarak mint edilip edilmediği.
    }

    // Beat ID'sinden Beat yapısına erişim sağlayan mapping.
    mapping(uint256 => Beat) public beats;
    
    // Hangi NFT ID'sinin hangi Beat'e ait olduğunu takip eden mapping.
    mapping(uint256 => uint256) public tokenIdToBeadId;

    // NFT metadata URI'lerini saklayan mapping.
    mapping(uint256 => string) private _tokenURIs;

    // Event'ler (olaylar), off-chain uygulamaların kontrat etkileşimlerini dinlemesini sağlar.
    event BeatStarted(uint256 indexed beatId, address indexed contributor, string segmentCID);
    event SegmentAdded(uint256 indexed beatId, address indexed contributor, string segmentCID);
    event BeatCompleted(uint256 indexed beatId);
    event BeatMinted(uint256 indexed beatId, uint256 indexed tokenId, address minter);

    // Kontrat oluşturulduğunda ERC721 standardına göre NFT'nin adını ve sembolünü belirler.
    constructor() ERC721("BeatChain", "BEAT") {}

    /**
     * @notice Yeni bir Beat başlatır.
     * @param _segmentCID İlk 4 saniyelik ses parçasının IPFS CID'si.
     */
    function startBeat(string memory _segmentCID) public {
        require(bytes(_segmentCID).length > 0, "BeatChain: Segment CID cannot be empty.");

        _beatIdCounter.increment();
        uint256 newBeatId = _beatIdCounter.current();

        Beat storage newBeat = beats[newBeatId];
        newBeat.id = newBeatId;
        newBeat.status = Status.InProgress;
        newBeat.segmentCount = 1;
        
        newBeat.contributors[0] = msg.sender;
        newBeat.segmentCIDs[0] = _segmentCID;

        emit BeatStarted(newBeatId, msg.sender, _segmentCID);
    }

    /**
     * @notice Mevcut bir Beat'e yeni bir ses segmenti ekler.
     * @param _beatId Segment eklenecek Beat'in ID'si.
     * @param _segmentCID Yeni ses segmentinin IPFS CID'si.
     */
    function addSegment(uint256 _beatId, string memory _segmentCID) public {
        require(bytes(_segmentCID).length > 0, "BeatChain: Segment CID cannot be empty.");
        
        Beat storage currentBeat = beats[_beatId];

        require(currentBeat.id != 0, "BeatChain: Beat does not exist.");
        require(currentBeat.status == Status.InProgress, "BeatChain: Beat is already completed.");
        require(currentBeat.contributors[0] != msg.sender && currentBeat.contributors[1] != msg.sender, "BeatChain: You have already contributed to this Beat.");

        uint8 currentSegmentIndex = currentBeat.segmentCount;
        currentBeat.contributors[currentSegmentIndex] = msg.sender;
        currentBeat.segmentCIDs[currentSegmentIndex] = _segmentCID;
        currentBeat.segmentCount++;

        emit SegmentAdded(_beatId, msg.sender, _segmentCID);

        if (currentBeat.segmentCount == 3) {
            currentBeat.status = Status.Completed;
            emit BeatCompleted(_beatId);
        }
    }

    /**
     * @notice Tamamlanmış bir Beat'i ERC-721 NFT'si olarak mint eder.
     * @param _beatId Mint edilecek Beat'in ID'si.
     * @param _metadataCID Backend tarafından oluşturulan metadata JSON dosyasının IPFS CID'si.
     */
    function mint(uint256 _beatId, string memory _metadataCID) public {
        require(bytes(_metadataCID).length > 0, "BeatChain: Metadata CID cannot be empty.");

        Beat storage currentBeat = beats[_beatId];

        require(currentBeat.id != 0, "BeatChain: Beat does not exist.");
        require(currentBeat.status == Status.Completed, "BeatChain: Beat is not completed yet.");
        require(!currentBeat.isMinted, "BeatChain: This Beat has already been minted.");

        currentBeat.isMinted = true;
        
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        
        tokenIdToBeadId[newTokenId] = _beatId;
        
        string memory finalTokenURI = string(abi.encodePacked("ipfs://", _metadataCID));
        _tokenURIs[newTokenId] = finalTokenURI;

        _safeMint(msg.sender, newTokenId);
        
        emit BeatMinted(_beatId, newTokenId, msg.sender);
    }
    
    /**
     * @notice ERC721 standardının gerektirdiği `tokenURI` fonksiyonunu override eder.
     * @dev Bir NFT'nin metadata'sına işaret eden URI'yi döndürür.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "ERC721Metadata: URI query for nonexistent token");
        
        return uri;
    }
}
