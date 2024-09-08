import { HomeAssistant } from "../types";

export const setDurationValue = (
  hass: HomeAssistant,
  entityId: string,
  duration: string | undefined = undefined
) => {
  const param = { entity_id: entityId, duration: duration };
  hass.callService("duration", "set_value", param);
};
