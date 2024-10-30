import { NFTOffer} from 'xrpl';

export interface NFT {
    offers: NFTOffer[];
    id: number;
    nftID: string;
    receiveAddress: string;
    createByAddress: string;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  