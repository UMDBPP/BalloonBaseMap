import './layerswitcher.css';
import URLHash from './urlhash';
import { Layer, LayerGroup } from './data';
import type maplibregl from 'maplibre-gl';
/**
 * A layer switcher control for MapLibre GL JS.
 */
declare class LayerSwitcher implements maplibregl.IControl {
    _layers: (Layer | LayerGroup)[];
    _layerIndex: Record<string, Layer>;
    _container: HTMLElement;
    _visible: string[];
    _default_visible: string[];
    _layerList: HTMLElement;
    _map: maplibregl.Map | undefined;
    urlhash: URLHash | undefined;
    /**
     * A layer switcher control for MapLibre GL JS.
     *
     * @param layers a list of `Layer` or `LayerGroup` objects.
     * @param title the title of the layer switcher (default "Layers").
     */
    constructor(layers: (Layer | LayerGroup)[], title?: string);
    getLayers(): Layer[];
    setVisibility(layerId: string, visible: boolean): void;
    _updateVisibility(): void;
    /**
     * Modify a MapLibre GL style object before creating the map to set initial visibility states.
     * This prevents flash-of-invisible-layers.
     *
     * @param style the MapLibre GL style object to modify
     */
    setInitialVisibility(style: maplibregl.StyleSpecification): void;
    getURLString(): string;
    setURLString(string: string): void;
    onAdd(map: maplibregl.Map): HTMLDivElement;
    onRemove(): void;
    getDefaultPosition: () => maplibregl.ControlPosition;
    _getLayerElement(item: Layer | LayerGroup): Node;
    _updateList(): void;
}
export default LayerSwitcher;
//# sourceMappingURL=layerswitcher.d.ts.map