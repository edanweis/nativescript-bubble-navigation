/// <reference path="./platforms/ios/bubble-navigation.ios.d.ts" />

import { BubbleNavigationBase, BubbleNavigationItemBase, tabsProperty, tabBackgroundColorProperty } from "./bubble-navigation.common";
import { Application, Utils, View, Color, ImageSource } from '@nativescript/core';


@NativeClass()
export class BottomBarControllerDelegate extends NSObject implements UITabBarControllerDelegate {
    public static ObjCProtocols = [UITabBarControllerDelegate];

    private _owner: WeakRef<BubbleNavigation>;

    public static initWithOwner(owner: WeakRef<BubbleNavigation>): BottomBarControllerDelegate {
        const delegate = <BottomBarControllerDelegate>BottomBarControllerDelegate.new();
        delegate._owner = owner;
        return delegate;
    }

    tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController) {
        const owner = this._owner.get();
        owner.onTabSelected(tabBarController.selectedIndex);
    }
}

@NativeClass()
export class BubbleNavigation extends BubbleNavigationBase {

    public _tabBarController: BubbleTabBarController;
    private _delegate: BottomBarControllerDelegate;
    // _items: BottomBarItem[];

    nativeView: any;

    get ios(): any {
        return this.nativeView;
    }

    public createNativeView(): Object {
        this._tabBarController = BubbleTabBarController.new();
        let bottomSafeArea = 0;
        if (Application.ios.window.safeAreaInsets) {
            bottomSafeArea = Application.ios.window.safeAreaInsets.bottom;
        }

        const bottomBarHeight = 50 + bottomSafeArea;

        const actualHeight = this.getActualSize().height;
        this.height = actualHeight ? actualHeight : bottomBarHeight;

        return this._tabBarController.tabBar;
    }

    initNativeView(): void {
        (<any>this.nativeView).owner = this;
        super.initNativeView();
        this._delegate = this._tabBarController.delegate = BottomBarControllerDelegate.initWithOwner(new WeakRef(this));
    }

    disposeNativeView(): void {
        (<any>this.nativeView).owner = null;

        super.disposeNativeView();
    }

    private setViewControllers(): void {
        this._tabBarController.viewControllers = (NSArray as any).arrayWithArray(
            this._tabs.map(tab => tab.viewController)
        );
    }

    private createItem(value: BubbleNavigationItem, id: number): BubbleNavigationItem {
        const itemViewController = this.createItemViewController(value, id);
        value.viewController = itemViewController;
        value.setNativeView(itemViewController.tabBarItem);
        return value;
    }

    private createItemViewController(tab: BubbleNavigationItem, id: number): UIViewController {
        const itemViewController: UIViewController = UIViewController.new();
        itemViewController.tabBarItem = CBTabBarItem.new();
        tab.index = id;
        let icon;
        if (Utils.isFileOrResourcePath(tab.icon)) {
            icon = ImageSource.fromFileOrResourceSync(tab.icon).ios;
        } else {
            icon = UIImage.imageNamed(tab.icon);
        }

        let item: CBTabBarItem = CBTabBarItem.alloc().initWithTitleImageTag(tab.title, icon, tab.index);

        if (tab.colorActive) {
            item.tintColor = new Color(tab.colorActive).ios;
        }

        if (tab.colorInactive) {
            item.tintInactiveColor = new Color(tab.colorInactive).ios;
        } else {

        }

        itemViewController.tabBarItem = item;

        return itemViewController;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const width = Utils.layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = Utils.layout.getMeasureSpecMode(widthMeasureSpec);

        const height = Utils.layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = Utils.layout.getMeasureSpecMode(heightMeasureSpec);

        const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    bindTabs(tabs: BubbleNavigationItem[]) {
        if (tabs) {
            this._tabs = [...tabs];

            this._tabs.forEach((tab: BubbleNavigationItem, index: number) => {
                this.createItem(tab, index);
            });
            this.setViewControllers();
        }
    }

    protected selectTabNative(index: number): void {
        this._tabBarController.selectedIndex = index;
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
        this.nativeView.barTintColor = new Color(color).ios;
    }
}

@NativeClass()
export class BubbleNavigationItem extends BubbleNavigationItemBase {
    nativeView: CBTabBarItem;

    constructor(title: string, icon: string, colorActive?: string, colorInactive?: string) {
        super(title, icon, colorActive, colorInactive);
    }
}
