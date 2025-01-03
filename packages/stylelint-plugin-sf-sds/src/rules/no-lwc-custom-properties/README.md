### No LWC Custom Properties

> **Use of --lwc custom properties.** In the Summer ’24 release, the --lwc custom properties still work in Lightning pages and Experience Cloud sites.
>
> - However, in Lightning pages, we strongly encourage you to replace --lwc custom properties during the Summer ’24 release with --slds styling hooks to avoid regressions when they’re removed in a future release.
>
> - In Experience Cloud LWR sites, when referencing  --lwc custom properties, we strongly encourage you to replace them with --dxp,  --slds-c, or --slds-g-color styling hooks. If you’re setting --lwc custom properties, you don’t need to take any action at this time. See  –dxp Styling Hooks.

[Reference](https://help.salesforce.com/s/articleView?id=001622574&type=1)

#### Example - LWC Custom Property Override

<details>
<summary>Before</summary>

```css
:host {
  --lwc-fontSize3: 2rem;
}
```

```html
<lightning-card title="Hello" >
  <p class="slds-var-p-horizontal_small">The footer on this card has had a CSS override applied using the lwc custom property rather than slds.</p>
  <p slot="footer">Card Footer</p>
</lightning-card>
```

</details>

<details>
<summary>After</summary>

```css

:host {
  --slds-c-card-footer-font-size: 3rem;
}
```

```html
<lightning-card title="Hello" >
  <p class="slds-var-p-horizontal_small">The footer on this card now uses the slds custom property as a replacement for lwc.</p>
  <p slot="footer">Card Footer</p>
</lightning-card>
```

</details>