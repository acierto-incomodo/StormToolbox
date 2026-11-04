async function run(action) {
  const output = document.getElementById("output");
  output.textContent = "Ejecutando...\n";

  const result = await window.api.runAction(action);

  output.textContent += result;
}

async function checkUpdates() {
  const output = document.getElementById("output");
  output.textContent = "Buscando actualizaciones...\n";

  await window.api.checkUpdates();

  output.textContent += "Comprobación completada\n";
}
