export interface SessionDeployment {
  address: string
  blockNumber: number
}

let sessionDeployment: SessionDeployment | null = null

export function getSessionDeployment(): SessionDeployment | null {
  return sessionDeployment
}

export function setSessionDeployment(deployment: SessionDeployment): void {
  sessionDeployment = deployment
}
