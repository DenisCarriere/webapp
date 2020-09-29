import { createModule, action, mutation } from "vuex-class-component";
import { ContractMethods, EthAddress } from "@/types/bancor";
import { shrinkToken } from "@/api/eth/helpers";
import {
  buildGovernanceContract,
  buildTokenContract
} from "@/api/eth/contractTypes";
import { CallReturn } from "eth-multicall";
import { ContractSendMethod } from "web3-eth-contract";

export const governanceContractAddress =
  "0x6F1DfdA2a7303d88d9a5AEe694988158102de668";
export const etherscanUrl = "https://kovan.etherscan.io/";
export const ipfsUrl = "https://ipfs.io/ipfs/";

const VuexModule = createModule({
  strict: false
});

export interface Proposal {
  id: number;
  // timestamp
  start: number;
  // timestamp
  end: number;
  name: string;
  executor: EthAddress;
  hash: string;
  open: boolean;
  proposer: EthAddress;
  quorum: string;
  quorumRequired: string;
  totalVotesAgainst: number;
  totalVotesFor: number;
  totalVotes: number;
  totalVotesAvailable: number;
  votes: {
    voted: undefined | "for" | "against";
    for: number;
    against: number;
  };
}

interface Token
  extends ContractMethods<{
    symbol: () => CallReturn<string>;
    decimals: () => CallReturn<string>;
    totalSupply: () => CallReturn<string>;
    allowance: (owner: string, spender: string) => CallReturn<string>;
    balanceOf: (owner: string) => CallReturn<string>;
    transferOwnership: (converterAddress: string) => ContractSendMethod;
    issue: (address: string, wei: string) => ContractSendMethod;
    transfer: (to: string, weiAmount: string) => ContractSendMethod;
    approve: (
      approvedAddress: string,
      approvedAmount: string
    ) => ContractSendMethod;
  }> {}

interface Governance
  extends ContractMethods<{
    voteFor: (proposalId: string) => ContractSendMethod;
    voteAgainst: (proposalId: string) => ContractSendMethod;
    stake: (amount: string) => ContractSendMethod;
    unstake: (amount: string) => ContractSendMethod;
    decimals: () => CallReturn<string>;
    proposalCount: () => CallReturn<number>;
    proposals: (proposalI: number) => CallReturn<Proposal>;
    votesOf: (voter: string) => CallReturn<string>;
    votesForOf: (voter: string, proposalId: number) => CallReturn<string>;
    votesAgainstOf: (voter: string, proposalId: number) => CallReturn<string>;
    voteLocks: (voter: string) => CallReturn<string>;
    govToken: () => CallReturn<string>;
  }> {}

export class EthereumGovernance extends VuexModule.With({
  namespaced: "ethGovernance/"
}) {
  governanceContract: Governance = {} as Governance;
  tokenContract: Token = {} as Token;

  isLoaded: boolean = false;
  symbol?: string;

  @mutation
  setContracts({
    governance,
    token
  }: {
    governance: Governance;
    token: Token;
  }) {
    this.tokenContract = token;
    this.governanceContract = governance;
    this.isLoaded = true;
    console.log(
      "contracts set",
      Date.now(),
      this.tokenContract,
      this.governanceContract
    );
  }

  @mutation
  setSymbol(symbol: string) {
    this.symbol = symbol;
  }

  @action
  async getTokenAddress(): Promise<EthAddress> {
    return this.tokenContract.options.address;
  }

  @action
  async init() {
    const governanceContract: Governance = buildGovernanceContract(
      governanceContractAddress
    );

    const tokenAddress = await governanceContract.methods.govToken().call();
    console.log("vote token address", tokenAddress);

    await this.setContracts({
      governance: governanceContract,
      token: buildTokenContract(tokenAddress)
    });
  }

  @action
  async getSymbol(): Promise<string> {
    if (!this.symbol) {
      const symbol = await this.tokenContract.methods.symbol().call();
      this.setSymbol(symbol);
      return symbol;
    } else {
      return this.symbol;
    }
  }

  @action
  async getVotes({ voter }: { voter: EthAddress }): Promise<number> {
    if (!voter) throw new Error("Cannot get votes without voter address");

    console.log("getting votes");
    const [decimals, weiVotes] = await Promise.all([
      Number(await this.tokenContract.methods.decimals().call()),
      this.governanceContract.methods.votesOf(voter).call()
    ]);
    return parseFloat(shrinkToken(weiVotes, decimals));
  }

  @action
  async getBalance({ account }: { account: EthAddress }): Promise<number> {
    if (!account) throw new Error("Cannot get balance without address");

    console.log("getting balance");
    const [decimals, weiBalance] = await Promise.all([
      this.tokenContract.methods.decimals().call(),
      this.tokenContract.methods.balanceOf(account).call()
    ]);
    return parseFloat(shrinkToken(weiBalance, Number(decimals)));
  }

  @action
  async getLock({
    account
  }: {
    account: EthAddress;
  }): Promise<{ till: number; for: number }> {
    if (!account) throw new Error("Cannot get lock without address");

    const till =
      Number(await this.governanceContract.methods.voteLocks(account).call()) *
      1000;
    // for
    const lockedFor = till - Date.now();

    const lock = {
      till,
      for: lockedFor > 0 ? lockedFor : 0
    };

    console.log(lock);
    return lock;
  }

  @action
  async stake({
    account,
    amount
  }: {
    account: EthAddress;
    amount: string;
  }): Promise<boolean> {
    if (!account || !amount)
      throw new Error("Cannot stake without address or amount");

    await this.tokenContract.methods
      .approve(governanceContractAddress, amount.toString())
      .send({
        from: account
      });
    await this.governanceContract.methods.stake(amount.toString()).send({
      from: account
    });

    return true;
  }

  @action
  async unstake({
    account,
    amount
  }: {
    account: EthAddress;
    amount: string;
  }): Promise<boolean> {
    if (!account || !amount)
      throw new Error("Cannot unstake without address or amount");

    await this.governanceContract.methods.unstake(amount.toString()).send({
      from: account
    });

    return true;
  }

  @action
  async voteFor({
    account,
    proposalId
  }: {
    account: EthAddress;
    proposalId: string;
  }): Promise<boolean> {
    if (!account || !proposalId)
      throw new Error("Cannot vote for without address or proposal id");

    await this.governanceContract.methods.voteFor(proposalId.toString()).send({
      from: account
    });

    return true;
  }

  @action
  async voteAgainst({
    account,
    proposalId
  }: {
    account: EthAddress;
    proposalId: string;
  }): Promise<boolean> {
    if (!account || !proposalId)
      throw new Error("Cannot vote against without address or proposal id");

    await this.governanceContract.methods
      .voteAgainst(proposalId.toString())
      .send({
        from: account
      });

    return true;
  }

  @action
  async getProposals({ voter }: { voter?: string }): Promise<Proposal[]> {
    console.log(
      "getting proposals",
      Date.now(),
      this.isLoaded,
      this.governanceContract,
      this.tokenContract
    );
    const proposalCount = await this.governanceContract.methods
      .proposalCount()
      .call();

    const decimals = Number(await this.tokenContract.methods.decimals().call());
    const proposals: Proposal[] = [];

    for (let i = 0; i < proposalCount; i++) {
      const proposal = await this.governanceContract.methods
        .proposals(i)
        .call();

      const totalVotesFor = parseFloat(
        shrinkToken(proposal.totalVotesFor, decimals)
      );
      const totalVotesAgainst = parseFloat(
        shrinkToken(proposal.totalVotesAgainst, decimals)
      );
      const totalVotesAvailable = parseFloat(
        shrinkToken(proposal.totalVotesAvailable, decimals)
      );

      let name;

      try {
        const metadata = await this.getFromIPFS({
          hash: proposal.hash,
          timeoutInSeconds: 5
        });
        console.log(metadata);

        name = (metadata && metadata.payload && metadata.payload.name) || null;
      } catch (err) {
        console.log("Getting metadata failed!", err);
      }

      const prop = {
        id: Number(proposal.id),
        start: Number(proposal.start) * 1000,
        end: Number(proposal.end) * 1000,
        executor: proposal.executor,
        hash: proposal.hash,
        open: proposal.open,
        name,
        proposer: proposal.proposer,
        quorum: proposal.quorum,
        quorumRequired: proposal.quorumRequired,
        totalVotesAgainst,
        totalVotesFor,
        totalVotesAvailable,
        totalVotes: totalVotesFor + totalVotesAgainst,
        votes: {
          for: voter
            ? parseFloat(
                shrinkToken(
                  await this.governanceContract.methods
                    .votesForOf(voter, proposal.id)
                    .call(),
                  decimals
                )
              )
            : 0,
          against: voter
            ? parseFloat(
                shrinkToken(
                  await this.governanceContract.methods
                    .votesAgainstOf(voter, proposal.id)
                    .call(),
                  decimals
                )
              )
            : 0
        } as any
      };
      const { for: vFor, against: vAgainst } = prop.votes;
      prop.votes.voted =
        vFor === vAgainst ? undefined : vFor > vAgainst ? "for" : "against";
      proposals.push(prop);
    }

    console.log("proposals", proposals);

    return proposals.reverse();
  }

  @action
  getFromIPFS({
    hash,
    timeoutInSeconds
  }: {
    hash: string;
    timeoutInSeconds: number;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = `${ipfsUrl}${hash}`;
      const t = setTimeout(() => {
        return reject(`Timeout at: ${url}`);
      }, timeoutInSeconds * 1000);

      fetch(url, {
        method: "GET"
      })
        .then(response => response.json())
        .then(data => {
          clearTimeout(t);
          console.log(data);
          return resolve(data);
        })
        .catch(reject);
    });
  }
}
