import {
  getModelForClass,
  index,
  modelOptions,
  prop,
} from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { customName: "Caves" },
})
@index({ coordinates: "2dsphere" }) // used for geo queries
@index({ narrative: "text" }) // Used for search
/**
 * Defines a cave with properties. Everything except id, name, coordinates
 * defaults to null.
 */
export class Cave {
  @prop({ required: true, type: String, unique: true, index: true })
  public id!: string;
  @prop({ required: true, type: String })
  public name!: string;
  @prop({ required: true, type: [Number], dim: 2 })
  public coordinates!: number[];
  @prop({ default: null, type: Number })
  public length?: number;
  @prop({ default: null, type: Number })
  public depth?: number;
  @prop({ default: null, type: Number })
  public pitDepth?: number;
  @prop({ default: null, type: Number })
  public numberOfPits?: number;
  @prop({ default: null, type: String })
  public countyName?: string;
  @prop({ default: null, type: String })
  public topoName?: string;
  @prop({ default: null, type: String })
  public topoIndication?: string;
  @prop({ default: null, type: Number })
  public elevation?: number;
  @prop({ default: null, type: String })
  public ownership?: string;
  @prop({ default: null, type: String })
  public requiredGear?: string;
  @prop({ default: null, type: String })
  public entranceType?: string;
  @prop({ default: null, type: String })
  public fieldIndication?: string;
  @prop({ default: null, type: String })
  public mapStatus?: string;
  @prop({ default: null, type: String })
  public geology?: string;
  @prop({ default: null, type: String })
  public geologyAge?: string;
  @prop({ default: null, type: String })
  public physiographicProvince?: string;
  @prop({ type: String, default: null })
  public narrative?: string;
}

const caveModel = getModelForClass(Cave);

export { caveModel as CaveModel };
