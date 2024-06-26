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

import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { stakingContractAddress } from "../const/yourDetails";

export default function Home() {
  const address = useAddress();
  const [amountToStake, setAmountToStake] = useState(0);
  const sdk = new ThirdwebSDK("polygon");

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
  const { data: totalStaked, refetch: refetchTotalStaked } =
    useContractRead(staking, "stakingTokenBalance");
    
  // Get staking data
  const {
    data: stakeInfo,
    refetch: refetchStakingInfo,
    isLoading: isStakeInfoLoading,
  } = useContractRead(staking, "getStakeInfo", [address || "0"]);

  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 2000);
  }, []);

  const refetchData = () => {
    refetchRewardTokenBalance(); 
    refetchStakingTokenBalance();
    refetchStakingInfo();
    refetchTotalStaked();
  };

  const tokenAddress = '0xD301511Ab784A2F79A70a39A4c90a8DA479e09a4';
  const tokenSymbol = 'points';
  const tokenAddress2 = '0x9B8cc6320F22325759B7D2CA5CD27347bB4eCD86';
  const tokenSymbol2 = 'pointless';
  const tokenDecimals = 18;
  const tokenImage = 'https://pbs.twimg.com/profile_images/1737784203025018881/KK_wEC7t_400x400.jpg';

  function formatCompactNumber(number) {
    if (typeof number != 'number') { return number }
    if (number < 1000) {
      return number.toFixed(4);
    } else if (number >= 1000 && number < 1_000_000) {
      return (number / 1000).toFixed(4) + "K";
    } else if (number >= 1_000_000 && number < 1_000_000_000) {
      return (number / 1_000_000).toFixed(4) + "M";
    } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
      return (number / 1_000_000_000).toFixed(4) + "B";
    } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
      return (number / 1_000_000_000_000).toFixed(4) + "T";
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Pointless Staking</h1>

        <p className={styles.description}>
          Stake your pointless to earn points!
        </p>

        <img src="/images/pointless.png" alt="Pointless logo" width="150" height="150"/><br/>

        <center>Staking has been discontinued. All stakers have been airdropped 5m $pointless.</center><br/>

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
        </div>

        <br/>

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
            isDisabled
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
            <h2>Total Staked</h2>
            <center><p>{formatCompactNumber((totalStaked && ethers.utils.formatEther(totalStaked.toString()) * 1))}</p></center>
          </a>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Pointless Balance</h2>
            <center><p>{formatCompactNumber(stakingTokenBalance?.displayValue * 1)}</p></center>
          </a>

          <a className={styles.card}>
            <h2>Pointless Staked</h2>
            <center><p>
              {formatCompactNumber((stakeInfo && ethers.utils.formatEther(stakeInfo[0].toString()) * 1))}
            </p></center>
          </a>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Points Balance</h2>
            <center><p>{formatCompactNumber(rewardTokenBalance?.displayValue * 1)}</p></center>
          </a>

          <a className={styles.card}>
            <h2>Points Accumulated</h2>
            <center><p>
              {formatCompactNumber(stakeInfo && ethers.utils.formatEther(stakeInfo[1].toString()) * 1)}
            </p></center>
          </a>
        </div>
      </main>
    </div>
  );
}
