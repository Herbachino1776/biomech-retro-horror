export function ignoreRuntimeWorldObjectFromUiCamera(scene, gameObject) {
  if (!scene?.uiCamera || !gameObject) {
    return;
  }

  scene.uiCamera.ignore(gameObject);
}
