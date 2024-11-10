import { NFTOffer} from 'xrpl';

export interface NFT {
    offers: NFTOffer[];
    id: number;
    nftID: string;
    receiveAddress: string;
    createByAddress: string;
    uri: string;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface IAuth{
  message: string;  
  signature: string;  
  publicKey: string;
}
  

export interface IMintNFT {
  auth: IAuth;  
  recipientAddress: string;  
  base64image: string; 
  name: string; 
  description: string; 
  gameMetadata: Record<string, string>;
}



export interface IBuyGameShopNFT {
  recipientAddress: string;  
  uri: string;
  gameAddress: string;
}