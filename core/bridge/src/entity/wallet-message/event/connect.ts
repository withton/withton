import { CHAIN } from "../../chain";
import { DeviceInfo } from "../../device";

export type ConnectionEvent = ConnectionSuccess | ConnectionError;

export interface ConnectionSuccess {
  eventType: "connection_success";
  eventId: number;
  data: {
    responses: ConnectionItemResponse[];
    deviceInfo: DeviceInfo;
  };
}

export interface ConnectionError {
  eventType: "connection_error";
  eventId: number;
  data: {
    errorCode: CONNECTION_ERROR_CODE;
    errorMessage: string;
  };
}

export enum CONNECTION_ERROR_CODE {
  UNKNOWN_ERROR = 0,
  INVALID_REQUEST = 1,
  MANIFEST_NOT_FOUND = 2,
  MANIFEST_INVALID = 3,
  APP_UNKNOWN_ERROR = 100,
  USER_REJECTED = 300,
  METHOD_NOT_SUPPORTED = 400,
}

export type ConnectionItemResponse = TonAddressResponse | TonProofResponse;

export interface TonAddressResponse {
  type: "ton_address";
  address: string;
  network: CHAIN;
  walletInitialization: string;
  publicKey: string;
}

export type TonProofResponse = TonProofResponseSuccess | TonProofResponseError;

export interface TonProofResponseSuccess {
  type: "ton_proof";
  proofDetails: {
    timestamp: number;
    domainInfo: {
      byteLength: number;
      domainValue: string;
    };
    payload: string;
    signature: string;
  };
}

export type TonProofResponseError = ConnectionItemErrorResponse<
  TonProofResponseSuccess["type"]
>;

export enum CONNECTION_ITEM_ERROR_CODE {
  UNKNOWN_ERROR = 0,
  METHOD_NOT_SUPPORTED = 400,
}

export type ConnectionItemErrorResponse<T> = {
  type: T;
  error: {
    errorCode: CONNECTION_ITEM_ERROR_CODE;
    errorMessage?: string;
  };
};
