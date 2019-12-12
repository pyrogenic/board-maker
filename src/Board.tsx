import React from 'react';
import SlideGrid, { ISlideGridTuning } from '@pyrogenic/slide-grid/lib/SlideGrid';
import '@pyrogenic/slide-grid/lib/SlideGrid.css';
import sample from 'lodash/sample';

export type TileType = 'empty' | 'blocker' | 'double-letter' | 'triple-letter' | 'double-word' | 'triple-word' | 'start';

export const TileTypes: TileType[] = [
    'empty',
    'blocker',
    'double-letter',
    'triple-letter',
    'double-word',
    'triple-word',
    'start',
];

export interface ITile {
    id: string;
    type: TileType;
}

export interface IBoardState {
    tiles: ITile[];
}

export interface IBoardProps {
    tuning: ISlideGridTuning;
    tiles: ITile[];
    height: number;
    width: number;

    onTap?: (key: string) => void;
    onSmear?: ((key: string) => void);
    onChange?: (tiles: ITile[]) => void;
};

export default class Board extends React.Component<IBoardProps, IBoardState> {

    constructor(props: Readonly<IBoardProps>) {
        super(props);
        this.state = {tiles: this.props.tiles};
    }

    public componentDidUpdate() {
        this.props.onChange?.(this.state.tiles);
    }

    public render() {
        const { tuning } = this.props;
        return <div className="board">
            <SlideGrid tuning={tuning} exchange={this.exchange} canExchange={this.canExchange} tap={this.props.onTap} smear={this.props.onSmear}>
                {this.state.tiles.map((tile) => <div className={"tile " + tile.type} key={tile.id} id={tile.id}/>)}
            </SlideGrid>
        </div>;
    }

    protected canExchange?(a: string, b?: string): boolean | number;

    protected getTileById(id: string) {
        return this.state.tiles.find((e) => e.id === id)!;
    }

    protected getTileIndexById(id: string) {
        return this.state.tiles.findIndex((e) => e.id === id)!;
    }

    protected renderTileContent(tile: ITile) {
        return <div className={tile.type} />;
    }

    protected exchange = (a: string, b: string) => {
        this.setState((state) => {
            const ai = state.tiles.findIndex((e) => e.id === a);
            const bi = state.tiles.findIndex((e) => e.id === b);
            const tiles: ITile[] = [];
            state.tiles.forEach((tile, i) => {
                if (i === ai) {
                    tiles[bi] = tile;
                } else if (i === bi) {
                    tiles[ai] = tile;
                } else {
                    tiles[i] = tile;
                }
            });
            return { tiles };
        })
    }

}
