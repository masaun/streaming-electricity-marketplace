pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { ERC20Detailed } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


/***
 * @title - Streamr's DataToken contract (Mock)
 **/
contract DataToken is ERC20, ERC20Detailed {

    constructor() public ERC20Detailed("Mock Data Token", "MDT", 18) {}

    function mint(address to, uint mintAmount) public returns (bool) {
        _mint(to, mintAmount);
    }

    function burn(address to, uint burnAmount) public returns (bool) {
        _burn(to, burnAmount);
    }

}
