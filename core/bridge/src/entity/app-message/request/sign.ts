export interface SignDataRequest {
  method: 'signData';
  parameters: SignDataParameters[];
  requestId: string;
}

export interface SignDataParameters {
  schemaCrc: number;
  encodedData: string;
}
