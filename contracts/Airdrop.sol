// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop is Ownable {
    struct AirdropData {
        address to;
        uint256 amount;
        uint256 airdropAmount;
    }

    struct AirdropState {
        uint256 taconAmount;
        uint256 plungerAmount;
        uint256 airdropAmount;
        bool airdropped;
    }

    uint256 public constant AIRDROP_PERIOD = 7 days;
    uint256 public constant AIRDROP_AMOUNT = 15000 * 10 ** 18;

    mapping(address => AirdropState) public airdrops;
    uint256 public startAirdropTime;
    address public airdropToken;

    event Airdropped(address to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        airdropToken = _token;
    }

    function startAirdrop() external onlyOwner {
        require(startAirdropTime == 0, "Airdrop: already started");
        startAirdropTime = block.timestamp;

        IERC20(airdropToken).transferFrom(
            msg.sender,
            address(this),
            AIRDROP_AMOUNT
        );
    }

    function setTaconAirdrop(AirdropData[] memory _data) external onlyOwner {
        require(startAirdropTime == 0, "Airdrop: already started");
        for (uint i = 0; i < _data.length; i++) {
            address _to = _data[i].to;
            uint256 _amount = _data[i].amount;
            uint256 _supply = _data[i].airdropAmount;

            AirdropState storage _state = airdrops[_to];
            _state.taconAmount += _amount;
            _state.airdropAmount += _supply;
        }
    }

    function setPlungerAirdrop(AirdropData[] memory _data) external onlyOwner {
        require(startAirdropTime == 0, "Airdrop: already started");
        for (uint i = 0; i < _data.length; i++) {
            address _to = _data[i].to;
            uint256 _amount = _data[i].amount;
            uint256 _supply = _data[i].airdropAmount;

            AirdropState storage _state = airdrops[_to];
            _state.plungerAmount += _amount;
            _state.airdropAmount += _supply;
        }
    }

    function airdrop() external {
        address _sender = msg.sender;
        require(startAirdropTime > 0, "Airdrop: not started yet");
        require(
            startAirdropTime + AIRDROP_PERIOD >= block.timestamp,
            "Airdrop: already finished"
        );
        uint256 amount = airdrops[_sender].airdropAmount;
        require(amount > 0, "Airdrop: no airdrop account");
        require(!airdrops[_sender].airdropped, "Airdrop: already airdopped");

        IERC20(airdropToken).transfer(_sender, amount);
        airdrops[_sender].airdropped = true;

        emit Airdropped(_sender, amount);
    }

    function withdraw(address to) external onlyOwner {
        require(
            startAirdropTime + AIRDROP_PERIOD < block.timestamp,
            "Airdrop: not finished yet"
        );
        uint256 balance = IERC20(airdropToken).balanceOf(address(this));
        if (balance > 0) {
            IERC20(airdropToken).transfer(to, balance);
        }
    }
}
