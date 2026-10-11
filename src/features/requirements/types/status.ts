import type {
  devStatusEnum,
  priorityEnum,
  prStateEnum,
  qaStatusEnum,
  specStatusEnum,
} from "@/lib/db/schema"

export type DevStatus = (typeof devStatusEnum.enumValues)[number]

export type QaStatus = (typeof qaStatusEnum.enumValues)[number]

export type SpecStatus = (typeof specStatusEnum.enumValues)[number]

export type Priority = (typeof priorityEnum.enumValues)[number]

export type PrState = (typeof prStateEnum.enumValues)[number]
