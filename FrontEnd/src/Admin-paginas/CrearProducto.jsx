import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getImagen } from '../config';
import './estilos-admin/CrearProducto.css';

const FORM_INICIAL = {
  Nombre_producto: '',
  Descripcion: '',
  Categoria: '',
  Precio: '',
  Stock: '',
  imagen: ''
};

const CrearProducto = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [formData, setFormData] = useState(FORM_INICIAL);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setExito('');

    if (!formData.Nombre_producto.trim()) {
      setError('El nombre del producto es obligatorio');
      setCargando(false);
      return;
    }

    if (!formData.Categoria) {
      setError('La categoría es obligatoria');
      setCargando(false);
      return;
    }

    if (!formData.Precio || Number(formData.Precio) <= 0) {
      setError('El precio debe ser mayor a 0');
      setCargando(false);
      return;
    }

    if (Number(formData.Stock) < 0) {
      setError('El stock no puede ser negativo');
      setCargando(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const payload = {
        ...formData,
        Precio: Number(formData.Precio),
        Stock: Number(formData.Stock)
      };

      // --- DIAGNÓSTICO (quitar cuando funcione) ---
      console.log(
        'API_URL:', API_URL,
        '| VITE_API_URL:', import.meta.env.VITE_API_URL,
        '| MODE:', import.meta.env.MODE
      );
      console.log('Token presente:', !!token);
      console.log('Payload enviado:', payload);
      // --------------------------------------------

      await axios.post(`${API_URL}/api/productos`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExito('Producto creado correctamente');

      setTimeout(() => {
        setFormData(FORM_INICIAL);
        setExito('');
      }, 2000);

    } catch (err) {
      console.error('Error al crear producto:', err.response?.data || err);
      console.error('Status:', err.response?.status, '| URL:', err.config?.url);
      setError(
        err.response?.data?.detalle ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al crear el producto'
      );
    } finally {
      setCargando(false);
    }
  };

  const volver = () => {
    navigate('/admin');
  };

  const limpiarFormulario = () => {
    setFormData(FORM_INICIAL);
    setError('');
    setExito('');
  };

  return (
    <div className="crear-producto-container">
      <div className="crear-producto-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver al Panel
        </button>
        <h1>CREAR NUEVO PRODUCTO</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {exito && <div className="exito-message">{exito}</div>}

      <div className="formulario-container">
        <form onSubmit={crearProducto}>
          <div className="form-group">
            <label>Nombre del producto *</label>
            <input
              type="text"
              name="Nombre_producto"
              value={formData.Nombre_producto}
              onChange={handleChange}
              placeholder="Ej: Café Tostado Premium"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Describe las características del producto..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select
                name="Categoria"
                value={formData.Categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Tostado">Tostado</option>
                <option value="Fino">Fino</option>
                <option value="Molido">Molido</option>
                <option value="Grano">Grano</option>
                <option value="Especial">Especial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                name="Stock"
                value={formData.Stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio ($) *</label>
              <input
                type="number"
                name="Precio"
                value={formData.Precio}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Imagen (nombre del archivo o URL)</label>
              <input
                type="text"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                placeholder="Ej: cafe-premium.jpg"
              />
              <small>
                El archivo debe estar en el bucket "productos" de Supabase, o pega la URL completa
              </small>
            </div>
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="btn-crear-form"
              disabled={cargando}
            >
              {cargando ? 'Creando...' : 'Crear Producto'}
            </button>
            <button
              type="button"
              className="btn-limpiar"
              onClick={limpiarFormulario}
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* Vista previa */}
        {formData.Nombre_producto && (
          <div className="vista-previa">
            <h3>Vista previa</h3>
            <div className="previa-card">
              <div className="previa-imagen">
                {formData.imagen ? (
                  <img
                    src={getImagen(formData.imagen)}
                    alt={formData.Nombre_producto}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/sin-imagen.png';
                    }}
                  />
                ) : (
                  <div className="previa-sin-imagen">📦 Sin imagen</div>
                )}
              </div>
              <div className="previa-info">
                <div className="previa-nombre">{formData.Nombre_producto}</div>
                <div className="previa-categoria">{formData.Categoria || 'Categoría'}</div>
                <div className="previa-precio">
                  ${Number(formData.Precio || 0).toLocaleString()}
                </div>
                <div className="previa-stock">Stock: {formData.Stock || '0'} unidades</div>
                {formData.Descripcion && (
                  <div className="previa-descripcion">
                    {formData.Descripcion.substring(0, 100)}
                    {formData.Descripcion.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearProducto;