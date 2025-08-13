// app/types/astPayload.ts

import type { Hazard } from './hazards'

export interface GeneralInfo {
  datetime?: string
  language?: string
}

export interface IsolationCircuit {
  name: string
  padlock: boolean
  voltage: boolean
  grounding: boolean
}

export interface Isolation {
  point?: string
  circuits?: IsolationCircuit[]
}

export interface Worker {
  name: string
  departureTime?: string
}

export interface ASTFormPayload {
  projectNumber?: string
  client?: string
  workLocation?: string
  clientRep?: string
  emergencyNumber?: string
  astClientNumber?: string
  workDescription?: string
  generalInfo?: GeneralInfo
  teamDiscussion?: string[]
  isolation?: Isolation
  hazards?: Hazard[]
  controlMeasures?: string[]
  workers?: Worker[]
  photos?: string[]
}

