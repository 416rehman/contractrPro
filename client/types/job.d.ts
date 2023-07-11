enum EStatus {
  OPEN,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

interface Job {
  id: string,
  identifier?: string,
  name?: string,
  description?: string,
  status?: EStatus
}