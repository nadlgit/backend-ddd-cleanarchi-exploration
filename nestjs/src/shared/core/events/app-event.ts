export type AppEvent<EventType extends string, EventData> = {
  readonly id: string;
  readonly occurredAt: Date;
  readonly type: EventType;
  readonly data: EventData;
};

export type AnyAppEvent = AppEvent<string, unknown>;
