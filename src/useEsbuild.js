import * as esbuild from 'esbuild-wasm';
import { useEffect } from 'react';

let esbuildInitializePromise = null;

export const useEsbuild = () => {
  useEffect(() => {
    if (!esbuildInitializePromise) {
      esbuildInitializePromise = esbuild.initialize({
        worker: true,
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm',
      });
    }
  }, []);
};

export const ensureEsbuildInitialized = async () => {
  if (esbuildInitializePromise) {
    await esbuildInitializePromise;
  }
}; 