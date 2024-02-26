export interface ParsedResult {
  Surname:string,
  GivenName:string,
  IDNumber:string,
  DateOfBirth:string,
  DateOfExpiry:string
}

export interface ScannedIDCard {
  backImage:string,
  frontImage:string,
  info:ParsedResult,
  timestamp:number
}

export class IDCardManager {
  constructor(){

  }
}