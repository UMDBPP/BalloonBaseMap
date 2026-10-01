/**
 * A layer in the layer switcher.
 */
export class Layer {
    constructor(id, title, prefix, groupIdOrEnabled = false, enabled = false) {
        this.enabled = false;
        this.id = id;
        this.title = title;
        this.prefix = prefix;
        if (typeof groupIdOrEnabled === 'string') {
            this.groupId = groupIdOrEnabled;
            this.enabled = enabled;
        }
        else {
            this.enabled = groupIdOrEnabled;
        }
    }
}
/**
 * A group of layers shown in the layer switcher.
 */
export class LayerGroup {
    /**
     * A group of layers shown in the layer switcher.
     *
     * @param title name of the group to be shown.
     * @param layers list of layers in the group.
     */
    constructor(title, layers) {
        this.title = title;
        this.layers = layers;
    }
}
