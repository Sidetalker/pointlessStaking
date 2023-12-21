import styles from "../styles/Home.module.css";
import Image from "next/image";

import {
  ConnectWallet,
  useAddress,
  useContract,
  useContractRead,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { stakingContractAddress } from "../const/yourDetails";

export default function Home() {
  const address = useAddress();
  const [amountToStake, setAmountToStake] = useState(0);

  // Initialize all the contracts
  const { contract: staking, isLoading: isStakingLoading } = useContract(
    stakingContractAddress,
    "custom"
  );

  // Get contract data from staking contract
  const { data: rewardTokenAddress } = useContractRead(staking, "rewardToken");
  const { data: stakingTokenAddress } = useContractRead(
    staking,
    "stakingToken"
  );

  // Initialize token contracts
  const { contract: stakingToken, isLoading: isStakingTokenLoading } =
    useContract(stakingTokenAddress, "token");
  const { contract: rewardToken, isLoading: isRewardTokenLoading } =
    useContract(rewardTokenAddress, "token");

  // Token balances
  const { data: stakingTokenBalance, refetch: refetchStakingTokenBalance } =
    useTokenBalance(stakingToken, address);
  const { data: rewardTokenBalance, refetch: refetchRewardTokenBalance } =
    useTokenBalance(rewardToken, address);

  // Get staking data
  const {
    data: stakeInfo,
    refetch: refetchStakingInfo,
    isLoading: isStakeInfoLoading,
  } = useContractRead(staking, "getStakeInfo", [address || "0"]);

  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 10000);
  }, []);

  const refetchData = () => {
    refetchRewardTokenBalance();
    refetchStakingTokenBalance();
    refetchStakingInfo();
  };

  const tokenAddress = '0xD301511Ab784A2F79A70a39A4c90a8DA479e09a4';
  const tokenSymbol = 'points';
  const tokenAddress2 = '0x9B8cc6320F22325759B7D2CA5CD27347bB4eCD86';
  const tokenSymbol2 = 'pointless';
  const tokenDecimals = 18;
  const tokenImage = 'https://i.pinimg.com/736x/d6/72/38/d672389be474e5920da7aeb9cc89bb09.jpg';

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pointless Staking</h1>

        <p className={styles.description}>
          Stake your pointless to earn points!
        </p>

        <div className={styles.connect}>
          <ConnectWallet />
        </div>

        <div>
          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20', 
                options: {
                  address: tokenAddress, 
                  symbol: tokenSymbol, 
                  decimals: tokenDecimals, 
                  image: tokenImage, 
                },
              },
            });}}
          >
            Add Points to Metamask
          </Web3Button>
          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20', 
                options: {
                  address: tokenAddress2, 
                  symbol: tokenSymbol2, 
                  decimals: tokenDecimals, 
                  image: tokenImage, 
                },
              },
            });}}
          >
            Add Pointless to Metamask
          </Web3Button>
        </div>

        <div className={styles.stakeContainer}>
          <input
            className={styles.textbox}
            type="number"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
          />

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await stakingToken.setAllowance(
                stakingContractAddress,
                amountToStake
              );
              await contract.call(
                "stake",
                [ethers.utils.parseEther(amountToStake)]
              );
              alert("Tokens staked successfully!");
            }}
          >
            Stake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call(
                "withdraw",
                [ethers.utils.parseEther(amountToStake)]
              );
              alert("Tokens unstaked successfully!");
            }}
          >
            Unstake!
          </Web3Button>

          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call("claimRewards", []);
              alert("Rewards claimed successfully!");
            }}
          >
            Claim rewards!
          </Web3Button>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Pointless Balance</h2>
            <p>{stakingTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Points Balance</h2>
            <p>{rewardTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Pointless Staked</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[0].toString())}
            </p>
          </a>

          <a className={styles.card}>
            <h2>Points Accumulated</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[1].toString())}
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
