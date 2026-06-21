import { useState, useEffect } from 'react'
import clienteAxios from './api/config'
import FormularioModal from './components/FormularioModal'
import './App.css'

function App() {
  const [titulos, setTitulos] = useState([]);
  const [reporte, setReporte] = useState([]); // Agregación 1: Vistas
  const [reporteCalidad, setReporteCalidad] = useState([]); // Agregación 2: Calificaciones
  const [modo, setModo] = useState('grid');
  const [modal, setModal] = useState({ abierto: false, tipo: null });
  const [seleccionado, setSeleccionado] = useState(null); 
  const [visualizaciones, setVisualizaciones] = useState([]); 

  const cargarDatos = async () => {
    try {
      const res = await clienteAxios.get('/titulos');
      setTitulos(res.data);
      setModo('grid');
      setSeleccionado(null);
    } catch (err) { console.error("Error al cargar", err); }
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- 1. OPERACIONES DE CREACIÓN Y ACTUALIZACIÓN ---

  const guardarPost = async (datos) => {
    try {
      const ruta = modal.tipo === 'titulo' ? '/titulos' : '/visualizaciones';
      await clienteAxios.post(ruta, datos);
      alert("✅ Registro exitoso");
      setModal({ abierto: false });
      cargarDatos();
    } catch (err) { alert("❌ Error al insertar"); }
  };

  const addExtra = async (tipo, id) => {
    const valor = prompt(`Ingrese el nuevo ${tipo === 'genero' ? 'Género' : 'Actor'}:`);
    if (!valor) return;
    try {
      const ruta = tipo === 'genero' ? 'agregar-genero' : 'agregar-actor';
      const payload = tipo === 'genero' ? { genero: valor } : { actor: valor };
      await clienteAxios.put(`/titulos/${ruta}/${id}`, payload);
      alert(`✨ ${tipo} añadido`);
      cargarDatos();
    } catch (err) { alert("❌ Error al actualizar lista"); }
  };

  const handleCalificacion = async () => {
    const idVista = prompt("Ingrese el id_visualizacion:");
    if (!idVista) return;
    const nota = prompt("Nueva calificación (1-5):");
    if (!nota) return;
    try {
      await clienteAxios.patch(`/visualizaciones/calificacion/${idVista}`, { 
        nueva_calificacion: Number(nota) 
      });
      alert("⭐ Calificación actualizada");
    } catch (err) { alert("❌ No se encontró el ID de visualización"); }
  };

  const actualizarEdad = async (id) => {
    const nueva = prompt("Nueva clasificación (ej: TV-MA):");
    if (!nueva) return;
    try {
      await clienteAxios.patch(`/titulos/actualizar-edad/${id}`, { nueva_edad: nueva });
      alert("🆙 Clasificación actualizada");
      cargarDatos();
    } catch (err) { alert("❌ Error al actualizar"); }
  };

  // --- 2. OPERACIONES DE CONSULTA (READ) ---

  const consultaEspecial = async (tipo, placeholder) => {
    let valor = "";
    if (tipo !== 'tipo/pelicula' && tipo !== 'tipo/serie') {
      valor = prompt(`Ingrese ${placeholder}:`);
      if (!valor) return;
    }
    
    try {
      const res = await clienteAxios.get(`/titulos/${tipo}${valor ? '/' + valor : ''}`);
      setTitulos(res.data);
      setModo('grid');
    } catch (err) { alert("❌ Sin resultados o ruta no encontrada en Back"); }
  };

  const verVisualizacionesPorFiltro = async (tipo) => {
    const p = prompt(`Ingrese ${tipo === 'pais' ? 'el País' : 'el id_titulo (ej: s56)'}:`);
    if (!p) return;
    try {
      const res = await clienteAxios.get(`/visualizaciones/${tipo}/${p}`);
      setVisualizaciones(res.data);
      setModo('vistas');
    } catch (err) { alert("❌ Error en la consulta de vistas"); }
  };

  // NUEVA LÓGICA: Ejecuta ambas agregaciones para el reporte
  const verRanking = async () => {
    try {
      // Llamada a Agregación 1 (Vistas) y Agregación 2 (Calidad)
      const [resVistas, resCalidad] = await Promise.all([
        clienteAxios.get('/reporte/conteo-visualizaciones'),
        clienteAxios.get('/reporte/mejores-calificados')
      ]);
      
      setReporte(resVistas.data);
      setReporteCalidad(resCalidad.data);
      setModo('reporte');
    } catch (err) { alert("❌ Error al generar reportes"); }
  };

  // --- 3. OPERACIÓN DE ELIMINACIÓN ---

  const borrar = async (id) => {
    if (confirm("¿Eliminar título definitivamente?")) {
      try {
        await clienteAxios.delete(`/titulos/${id}`);
        cargarDatos();
      } catch (err) { alert("❌ Error al borrar"); }
    }
  };

  const verDetalleDesdeVista = async (idTitulo) => {
    try {
        // Consulta directa por ID (antes traía TODO el catálogo y se congelaba)
        const res = await clienteAxios.get(`/titulos/id/${idTitulo}`);
        if(res.data) setSeleccionado(res.data);
        else alert("Detalles no disponibles para este ID");
    } catch (err) { console.log(err); }
  };

  return (
    <div className="app-container">
      <header className="header-netflix">
        <div className="logo-grande" onClick={cargarDatos} style={{cursor: 'pointer'}}>PLATAFORMA<span>STREAMING</span></div>
        <div className="nav-actions">
          <button className="btn-nav primary" onClick={() => setModal({ abierto: true, tipo: 'titulo' })}>+ Nuevo Título</button>
          <button className="btn-nav" onClick={() => setModal({ abierto: true, tipo: 'visualizacion' })}>+ Registrar Visualización</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar-queries">
          <div className="query-group">
            <h5>🔍 Filtros de Catálogo</h5>
            <button className="btn-query" onClick={() => consultaEspecial('tipo/pelicula')}>🎬 Ver solo Películas</button>
            <button className="btn-query" onClick={() => consultaEspecial('tipo/serie')}>📺 Ver solo Series</button>
            <button className="btn-query" onClick={() => consultaEspecial('genero', 'el Género')}>🎭 Por Género</button>
            <button className="btn-query" onClick={() => consultaEspecial('pais', 'el País')}>🌍 Por País</button>
            <button className="btn-query" onClick={() => consultaEspecial('anio', 'el Año')}>📅 Por Año</button>
          </div>

          <div className="query-group">
            <h5>📊 Análisis de Vistas</h5>
            <button className="btn-query" onClick={verRanking}>⭐ Popularidad y mejores calificados (agregaciones)</button>
            <button className="btn-query" onClick={() => verVisualizacionesPorFiltro('pais')}>📍 Vistas por País</button>
            <button className="btn-query" onClick={() => verVisualizacionesPorFiltro('titulo')}>📺 Vistas por ID Título</button>
          </div>

          <div className="query-group">
            <h5>⚙️ Gestión</h5>
            <button className="btn-query" onClick={handleCalificacion}>✍️ Modificar Calificación</button>
            <button className="btn-query" onClick={cargarDatos}>🔄 Refrescar Todo</button>
          </div>
        </aside>

        <main className="content-view">
          {modo === 'grid' && (
            <div className="movie-grid">
              {titulos.map(t => (
                <div key={t.id_titulo} className="movie-card" onClick={() => setSeleccionado(t)}>
                  <div className="card-badge">{t.tipo_contenido}</div>
                  <div className="card-img-placeholder">{t.id_titulo}</div>
                  <div className="card-body">
                    <h4>{t.titulo}</h4>
                    <p><strong>Dir:</strong> {t.director || 'N/A'}</p>
                    <p>{t.anio_lanzamiento} | {t.clasificacion_edad}</p>
                    <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => addExtra('genero', t.id_titulo)}>🎭</button>
                      <button className="icon-btn" onClick={() => addExtra('actor', t.id_titulo)}>👥</button>
                      <button className="icon-btn" onClick={() => actualizarEdad(t.id_titulo)}>🔞</button>
                      <button className="icon-btn del" onClick={() => borrar(t.id_titulo)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {modo === 'vistas' && (
            <div className="movie-grid">
              {visualizaciones.map(v => (
                <div key={v.id_visualizacion} className="view-card" onClick={() => verDetalleDesdeVista(v.id_titulo)}>
                  <div className="view-header">📍 {v.pais_usuario || 'Ubicación'}</div>
                  <div className="view-body">
                    <p><strong>ID Vista:</strong> {v.id_visualizacion}</p>
                    <p><strong>ID Título:</strong> {v.id_titulo}</p>
                    <div className="rating-stars">⭐ {v.calificacion_usuario || 'N/A'} / 5</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISTA DE REPORTES ACTUALIZADA (AMBAS AGREGACIONES) */}
          {modo === 'reporte' && (
            <div className="report-view">
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                
                {/* Agregación 1: Ranking Vistas */}
                <div>
                  <h2 style={{color: '#E50914'}}>🏆 Lista de Popularidad</h2>
                  <table className="report-table">
                    <thead><tr><th>ID Título</th><th>Vistas</th></tr></thead>
                    <tbody>
                      {reporte.map(r => (
                        <tr key={r._id}><td>{r._id}</td><td className="gold-text">{r.total} vistas {r.total > 5 ? '🔥' : ''}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Agregación 2: Ranking Calidad */}
                <div>
                  <h2 style={{color: '#FFD700'}}>⭐ Top 5 Mejor Calificados</h2>
                  <table className="report-table">
                    <thead><tr><th>ID Título</th><th>Promedio</th><th>Votos</th></tr></thead>
                    <tbody>
                      {reporteCalidad.map(q => (
                        <tr key={q._id}>
                          <td>{q._id}</td>
                          <td style={{color: '#FFD700', fontWeight: 'bold'}}>{q.promedio} / 5</td>
                          <td>{q.totalVotos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
              <button className="btn-nav primary" style={{marginTop:'30px'}} onClick={cargarDatos}>Regresar al catálogo</button>
            </div>
          )}
        </main>
      </div>

      {seleccionado && (
        <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
          <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSeleccionado(null)}>&times;</button>
            <div className="detail-header">
              <span className="type-tag">{seleccionado.tipo_contenido}</span>
              <h2>{seleccionado.titulo}</h2>
            </div>
            <div className="detail-info">
              <p><strong>ID:</strong> {seleccionado.id_titulo}</p>
              <p><strong>Director:</strong> {seleccionado.director || 'N/A'}</p>
              <p><strong>Elenco:</strong> {Array.isArray(seleccionado.elenco) ? seleccionado.elenco.join(', ') : seleccionado.elenco}</p>
              <p><strong>Géneros:</strong> {Array.isArray(seleccionado.generos) ? seleccionado.generos.join(', ') : seleccionado.generos}</p>
              <div className="description-box"><p>{seleccionado.descripcion}</p></div>
            </div>
          </div>
        </div>
      )}

      {modal.abierto && <FormularioModal tipo={modal.tipo} alCerrar={() => setModal({abierto: false})} alGuardar={guardarPost} />}
    </div>
  )
}

export default App;