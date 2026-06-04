import React, { useState } from 'react';

const FormularioModal = ({ tipo, alCerrar, alGuardar }) => {
  const [datos, setDatos] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    alGuardar(datos);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{tipo === 'titulo' ? 'Añadir Nuevo Título' : 'Registrar Visualización'}</h3>
        <form onSubmit={handleSubmit} className="diseno-form">
          {tipo === 'titulo' ? (
            <>
              <input type="text" placeholder="ID Título (ej: s101)" required onChange={e => setDatos({...datos, id_titulo: e.target.value})} />
              <input type="text" placeholder="Nombre de la Obra" required onChange={e => setDatos({...datos, titulo: e.target.value})} />
              <input type="text" placeholder="Director" onChange={e => setDatos({...datos, director: e.target.value})} />
              <input type="number" placeholder="Año" onChange={e => setDatos({...datos, anio_lanzamiento: e.target.value})} />
              <select onChange={e => setDatos({...datos, tipo_contenido: e.target.value})}>
                <option value="Película">Película</option>
                <option value="Serie">Serie</option>
              </select>
            </>
          ) : (
            <>
              <input type="text" placeholder="ID Visualización" required onChange={e => setDatos({...datos, id_visualizacion: e.target.value})} />
              <input type="text" placeholder="ID Título asociado" required onChange={e => setDatos({...datos, id_titulo: e.target.value})} />
              <input type="text" placeholder="País Usuario" onChange={e => setDatos({...datos, pais_usuario: e.target.value})} />
              <input type="number" placeholder="Calificación (1-5)" min="1" max="5" onChange={e => setDatos({...datos, calificacion_usuario: e.target.value})} />
              <input type="text" placeholder="Fecha (YYYY-MM-DD)" onChange={e => setDatos({...datos, fecha_visualizacion: e.target.value})} />
            </>
          )}
          <div className="modal-actions">
            <button type="button" onClick={alCerrar} className="btn-nav">Cancelar</button>
            <button type="submit" className="btn-nav primary">Guardar en Base de Datos</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioModal;