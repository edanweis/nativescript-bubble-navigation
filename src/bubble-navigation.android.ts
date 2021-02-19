/// <reference path="./platforms/android/bubble-navigation.android.d.ts" />

import {
    BubbleNavigationBase,
    BubbleNavigationItemBase,
    tabsProperty,
    paddingProperty,
    elevationProperty,
    tabBackgroundColorProperty,
} from './bubble-navigation.common';

import { Utils, Color } from '@nativescript/core';


let BubbleNavigationLinearView = com.gauravk.bubblenavigation.BubbleNavigationLinearView;
let BubbleToggleView = com.gauravk.bubblenavigation.BubbleToggleView;

@NativeClass()
export class BubbleNavigation extends BubbleNavigationBase {

    nativeView: any;

    private viewID: any;

    get android(): any {
        return this.nativeView;
    }

    createNativeView(): Object {
        this.nativeView = new BubbleNavigationLinearView(this._context);
        let owner = new WeakRef(this);

        this.nativeView.setNavigationChangeListener(new com.gauravk.bubblenavigation.listener.BubbleNavigationChangeListener({
            onNavigationChanged: (view, index: number) => {
                owner.get().onTabSelected(index);
            }
        }));

        return this.nativeView;
    }

    initNativeView(): void {
        this.viewID = android.view.View.generateViewId();

        this.nativeView.setId(this.viewID);
    }

    bindTabs(tabs: BubbleNavigationItem[]) {
        // if (this.tabs) {
        //     return;
        // }

        this._tabs = tabs;

        for (let tab of tabs) {
            const bubbleToggle = new BubbleToggleView(this._context);
            const id = android.view.View.generateViewId();
            (bubbleToggle as any).setId(id);
            bubbleToggle.setBtDuration(300);

            let icon = Utils.ad.resources.getDrawableId(tab.icon);
            bubbleToggle.setBtIcon(icon);
            bubbleToggle.setBtTitle(tab.title);

            if (tab.colorActive) {
                bubbleToggle.setBtColorActive(new Color(tab.colorActive).android);
            }

            if (tab.colorInactive) {
                bubbleToggle.setBtColorInactive(new Color(tab.colorInactive).android);
            }

            this.nativeView.addView(bubbleToggle);
        }

    }
    // Tabs Property
    [tabsProperty.getDefault](): BubbleNavigationItem[] {
        return null;
    }

    [tabsProperty.setNative](value: BubbleNavigationItem[]) {
        this.bindTabs(value);
    }

    // Main Color
    [tabBackgroundColorProperty.getDefault](): string {
        return null;
    }

    [tabBackgroundColorProperty.setNative](color: string) {
        this.nativeView.setBackgroundColor(new Color(color).android);

    }
    // Padding
    [paddingProperty.getDefault](): string {
        return null;
    }

    [paddingProperty.setNative](value: string) {
        const density = this._context.getResources().getDisplayMetrics().density;
        const dp = +value * density;
        this.nativeView.setPadding(dp, dp, dp, dp);
    }

    // Elevation
    [elevationProperty.getDefault](): string {
        return null;
    }

    [elevationProperty.setNative](value: string) {
        const density = this._context.getResources().getDisplayMetrics().density;
        const dp = +value * density;
        this.nativeView.setElevation(dp);
    }

    protected selectTabNative(index: number): void {
        this.nativeView.setCurrentActiveItem(index);
    }

}

@NativeClass()
export class BubbleNavigationItem extends BubbleNavigationItemBase {
    constructor(title: string, icon: string, colorActive?: string, colorInactive?: string) {
        super(title, icon, colorActive, colorInactive);
    }
}
