import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-date-input";
import { UNAVAILABLE } from "../../../data/entity";
import { setDurationValue } from "../../../data/duration";
import type { HomeAssistant } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { EntityConfig, LovelaceRow } from "./types";
import "../../../components/ha-duration-input";
import { createDurationData } from "../../../common/datetime/create_duration_data";

@customElement("hui-duration-entity-row")
class HuiDurationEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityConfig;

  public setConfig(config: EntityConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning>
          ${createEntityNotFoundWarning(this.hass, this._config.entity)}
        </hui-warning>
      `;
    }

    const unavailable = stateObj.state === UNAVAILABLE;

    return html`
      <hui-generic-entity-row .hass=${this.hass} .config=${this._config}>
        <ha-duration-input
          .data=${createDurationData(stateObj.state)}
          .locale=${this.hass.locale}
          .disabled=${unavailable}
          .enableDay=${stateObj.attributes.enable_day}
          .enableMillisecond=${stateObj.attributes.enable_millisecond}
          @value-changed=${this._durationChanged}
          @click=${this._stopEventPropagation}
        ></ha-duration-input>
      </hui-generic-entity-row>
    `;
  }

  private _stopEventPropagation(ev: Event): void {
    ev.stopPropagation();
  }

  private _durationChanged(ev: CustomEvent<{ value: string }>): void {
    if (ev.detail.value) {
      const stateObj = this.hass!.states[this._config!.entity];
      setDurationValue(this.hass!, stateObj.entity_id, ev.detail.value);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-duration-entity-row": HuiDurationEntityRow;
  }
}
