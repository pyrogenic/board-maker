import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './App.css';
import Board, { ITile, TileTypes } from './Board';
import { DEFAULT_TUNING } from '@pyrogenic/slide-grid/lib/SlideGrid';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import sample from 'lodash/sample';
import zip from 'lodash/zip';
import Form from 'react-bootstrap/Form';

enum MirrorMode {
  'None',
  'Vertical',
  'Horizontal',
  'Both',
  'Rotational',
};

const width = 13;
const height = 13;
const sessionStorageMode = Number(sessionStorage.getItem('board-maker/mirror') ?? MirrorMode.None);
const defaultMirrorMode = sessionStorageMode as MirrorMode; 

const App: React.FC = () => {
  const [tiles, setTiles] = React.useState(getDefaultTiles());
  const [mirror, setMirror] = React.useState(defaultMirrorMode);
  function onChangeTiles(newTiles: ITile[], forceMirror?: MirrorMode) {
    const mirrorMode = forceMirror ?? mirror;
    let changed = false;
    newTiles = [...newTiles];
    console.log({ mirrorMode });
    if (mirrorMode === MirrorMode.Horizontal || mirrorMode === MirrorMode.Both) {
      for (let y0 = 0; y0 < height; y0++) {
        for (let x0 = 0; x0 < width / 2; x0++) {
          const x1 = width - 1 - x0;
          const y1 = y0;
          copyType(y0, x0, y1, x1);
        }
      }
    }
    if (mirrorMode === MirrorMode.Vertical || mirrorMode === MirrorMode.Both) {
      for (let y0 = 0; y0 < height / 2; y0++) {
        for (let x0 = 0; x0 < width; x0++) {
          const x1 = x0;
          const y1 = height - 1 - y0;
          copyType(y0, x0, y1, x1);
        }
      }
    }
    if (mirrorMode === MirrorMode.Rotational) {
      for (let y0 = 0; y0 < height / 2; y0++) {
        for (let x0 = 0; x0 < width / 2; x0++) {
          let x1 = width - 1 - y0;
          let y1 = x0;
          copyType(y0, x0, y1, x1);
          x1 = width - 1 - x0;
          y1 = height - 1 - y0;
          copyType(y0, x0, y1, x1);
          x1 = y0;
          y1 = height - 1 - x0;
          copyType(y0, x0, y1, x1);
        }
      }
    }

    if (changed) {
      setTiles(newTiles);
    }

    function copyType(y0: number, x0: number, y1: number, x1: number) {
      const t0 = newTiles[y0 * width + x0];
      const t1 = newTiles[y1 * width + x1];
      if (t1.type !== t0.type) {
        console.log({ x0, y0, x1, y1, t0, t1 });
        t1.type = t0.type;
        changed = true;
      }
    }
  }
  function onChangeMirror(e: React.FormEvent<HTMLSelectElement>) {
    const mirrorMode: MirrorMode = Number(e.currentTarget.value);
    setMirror(mirrorMode); // this is delayed
    onChangeTiles(tiles, mirrorMode);
  }
  sessionStorage.setItem('board-maker/mirror', mirror.toString());
  sessionStorage.setItem('board-maker/board/tiles', JSON.stringify(tiles));
  return (
    <Container>
      <Row className="m-4">
        <Col>
        <Form.Control as="select" value={mirror.toString()} onChange={onChangeMirror}>
              {Object.entries(MirrorMode).map(([key, value]) => {
                if (typeof value === 'number') {
                  return <option key={key} value={value}>{key}</option>;
                }
              })}
            </Form.Control>
          <ButtonToolbar>
            <Button onClick={() => {
              tiles.forEach((tile) => tile.type = 'empty');
              setTiles([...tiles]);
            }}>
              Clear
              </Button>
            <Button onClick={() => {
              tiles.forEach((tile) => tile.type = sample(TileTypes)!);
              setTiles([...tiles]);
            }}>
              Random
              </Button>
          </ButtonToolbar>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Board
                width={13} height={13}
                tiles={tiles}
                tuning={{ ...DEFAULT_TUNING, motionOnRails: true }}
                onChange={onChangeTiles} />
            </Card.Body>
          </Card>
        </Col>
        <Col />
      </Row>
    </Container>
  );
};

function getDefaultTiles() {
  const tiles: ITile[] = JSON.parse(sessionStorage.getItem('board-maker/board/tiles') || "[]") as ITile[];
  for (let i = tiles.length; i < width * height; i++) {
    tiles.push({ id: `tile-${i}`, type: 'empty' });
  }
  return tiles;
}

export default App;
