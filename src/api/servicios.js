import clienteAxios from './config';

export const serviciosAPI = {
  // 1. Insertar un nuevo título
  crearTitulo: async (datos) => {
    return await clienteAxios.post('/titulos', datos);
  },

  // 2. Insertar una nueva visualización
  crearVisualizacion: async (datos) => {
    return await clienteAxios.post('/visualizaciones', datos);
  },

  // 3. Agregar un nuevo género a un título
  agregarGenero: async (id_titulo, genero) => {
    // Apunta a tu ruta PUT para actualizar el array de géneros
    return await clienteAxios.put(`/titulos/agregar-genero/${id_titulo}`, { genero });
  },

  // 4. Agregar un nuevo actor al elenco
  agregarActor: async (id_titulo, actor) => {
    // Apunta a tu ruta PUT para actualizar el array de elenco
    return await clienteAxios.put(`/titulos/agregar-actor/${id_titulo}`, { actor });
  },

  // 5. Registrar una calificación de usuario
  // Nota: Esto usualmente es un PATCH/PUT sobre una visualización existente o un POST nuevo.
  // Asumiendo que es una calificación ligada a una vista existente:
  registrarCalificacion: async (id_visualizacion, calificacion) => {
    return await clienteAxios.patch(`/visualizaciones/calificacion/${id_visualizacion}`, { 
      nueva_calificacion: Number(calificacion) 
    });
  }
};