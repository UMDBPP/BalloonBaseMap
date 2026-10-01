import { el, mount, unmount } from 'redom';
import isEqual from 'lodash.isequal';
// import './layerswitcher.css';
import { Layer, LayerGroup } from './data.js';
/**
 * A layer switcher control for MapLibre GL JS.
 */
class LayerSwitcher {
    /**
     * A layer switcher control for MapLibre GL JS.
     *
     * @param layers a list of `Layer` or `LayerGroup` objects.
     * @param title the title of the layer switcher (default "Layers").
     */
    constructor(layers, title = 'Layers') {
        this.getDefaultPosition = () => "top-right";
        this._layers = layers;
        this._layerIndex = {};
        for (let layer of this.getLayers()) {
            if (this._layerIndex[layer.id]) {
                throw new Error(`Duplicate layer ID "${layer.id}". Layer IDs must be unique.`);
            }
            this._layerIndex[layer.id] = layer;
        }
        this._visible = this._default_visible = Object.values(this._layerIndex)
            .filter((layer) => layer.enabled)
            .map((layer) => layer.id);
        this._layerList = el('ul');
        this._container = el('div', [el('h3', title), this._layerList], { class: 'layer-switcher-list' });
        mount(document.body, this._container);
    }
    getLayers() {
        const layers = [];
        for (let layer of this._layers) {
            if (layer instanceof LayerGroup) {
                layers.push(...layer.layers);
            }
            else if (layer instanceof Layer) {
                layers.push(layer);
            }
        }
        return layers;
    }
    setVisibility(layerId, visible) {
        if (visible) {
            if (!this._visible.includes(layerId)) {
                this._visible.push(layerId);
            }
        }
        else {
            this._visible = this._visible.filter((item) => item !== layerId);
        }
        this._updateVisibility();
    }
    _updateVisibility() {
        if (!this._map) {
            return;
        }
        var layers = this._map.getStyle().layers;
        for (let layer of layers) {
            let name = layer['id'];
            for (let layer_name in this._layerIndex) {
                let pref = this._layerIndex[layer_name].prefix;
                if (name.startsWith(pref)) {
                    if (this._visible.includes(layer_name)) {
                        this._map.setLayoutProperty(name, 'visibility', 'visible');
                    }
                    else {
                        this._map.setLayoutProperty(name, 'visibility', 'none');
                    }
                }
            }
        }
        if (this.urlhash) {
            this.urlhash._updateHash();
        }
    }
    /**
     * Modify a MapLibre GL style object before creating the map to set initial visibility states.
     * This prevents flash-of-invisible-layers.
     *
     * @param style the MapLibre GL style object to modify
     */
    setInitialVisibility(style) {
        for (let layer of style['layers']) {
            for (let layer_name in this._layerIndex) {
                let pref = this._layerIndex[layer_name].prefix;
                if (layer['id'].startsWith(pref) && !this._visible.includes(layer['id'])) {
                    if (!layer['layout']) {
                        layer['layout'] = {};
                    }
                    layer['layout']['visibility'] = 'none';
                }
            }
        }
        this._updateList();
    }
    getURLString() {
        if (!isEqual(this._visible.sort(), this._default_visible.sort())) {
            return this._visible.sort().join(',');
        }
        return '';
    }
    setURLString(string) {
        var _a;
        if (string) {
            const ids = string.split(',');
            if (ids.length == 0) {
                this._visible = [...this._default_visible];
            }
            else {
                this._visible = ids.filter((id) => this._layerIndex[id]).map((id) => id);
            }
        }
        else {
            this._visible = [...this._default_visible];
        }
        // If the style hasn't been loaded yet, don't update visibility or this causes
        // problems with the URLHash. Initial visibility is handled by the
        // `setInitialVisibility` method.
        if ((_a = this._map) === null || _a === void 0 ? void 0 : _a.isStyleLoaded()) {
            this._updateVisibility();
        }
        this._updateList();
    }
    onAdd(map) {
        this._map = map;
        if (map.isStyleLoaded()) {
            this._updateVisibility();
        }
        else {
            map.on('load', () => {
                this._updateVisibility();
            });
        }
        const button = el('button', {
            class: 'layer-switcher-button',
            'aria-label': 'Layer Switcher'
        });
        button.onmouseover = () => {
            this._container.classList.add('visible');
            var button_bounds = button.getBoundingClientRect();
            var container_bounds = this._container.getBoundingClientRect();
            this._container.style.top = window.pageYOffset + button_bounds.top + 'px';
            this._container.style.left = window.pageXOffset + button_bounds.right - container_bounds.width + 'px';
        };
        this._container.onmouseleave = () => {
            this._container.classList.remove('visible');
        };
        // return el('div', button, {
        //     class: 'maplibregl-ctrl maplibregl-ctrl-group layer-switcher'
        // });
        let elem = el('div', button);
        elem.classList.add('maplibregl-ctrl', 'maplibregl-ctrl-group', 'layer-switcher');
        return elem;
    }
    onRemove() {
        unmount(document.body, this._container);
        this._map = undefined;
    }
    _getLayerElement(item) {
        if (item instanceof Layer) {
            let input;
            if (item.groupId) {
                input = el('input', {
                    type: 'radio',
                    name: item.groupId,
                    value: item.id,
                    checked: this._visible.includes(item.id) ? 'checked' : undefined,
                    onchange: (e) => {
                        const radios = this._container.querySelectorAll(`input[name=${item.groupId}]`);
                        for (const radio of Array.from(radios)) {
                            this.setVisibility(radio.value, false);
                        }
                        const selected = this._container.querySelector(`input[name=${item.groupId}]:checked`);
                        if (selected) {
                            this.setVisibility(selected.value, true);
                        }
                    }
                });
            }
            else {
                input = el('input', {
                    type: 'checkbox',
                    checked: this._visible.includes(item.id),
                    onchange: (e) => {
                        this.setVisibility(item.id, e.target.checked);
                    }
                });
            }
            const label = el('label', item.title, input);
            return el('li', label);
        }
        else if (item instanceof LayerGroup) {
            return el('li.layer-switcher-group', [
                el('h4', item.title),
                el('ul', item.layers.map((layer) => this._getLayerElement(layer)))
            ]);
        }
        else {
            throw new Error('Unknown item type: ' + item);
        }
    }
    _updateList() {
        this._layerList.replaceChildren(...this._layers.map((item) => this._getLayerElement(item)));
    }
}
export default LayerSwitcher;
