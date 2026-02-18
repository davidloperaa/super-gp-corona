import React from 'react';
import { FileText, Shield, AlertTriangle, Lock } from 'lucide-react';

export const TerminosCondiciones = () => {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-black uppercase text-glow-red mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-white/70">
            Super GP Corona Club XP 2026
          </p>
        </div>

        <div className="bg-surface border border-white/10 p-8 space-y-10">
          {/* Section 1: General Terms */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-secondary" />
              <h2 className="font-heading text-2xl font-bold uppercase text-secondary">
                Términos y Condiciones Generales
              </h2>
            </div>
            
            <div className="bg-black/30 p-4 mb-6 text-white/80 space-y-2">
              <p><strong>Organizador:</strong> Carlos Alberto Alarcón Flórez</p>
              <p><strong>NIT:</strong> 10306883</p>
              <p><strong>Representante Legal:</strong> Carlos Alberto Alarcón Flórez</p>
              <p><strong>Dirección:</strong> SEC EL COFRE KM NUEVE VIA POPAYAN-CALI</p>
              <p><strong>Correo:</strong> coronaclubxtreme@gmail.com</p>
              <p><strong>Teléfono:</strong> 3104223288</p>
            </div>

            <p className="text-white/80 mb-4">
              El presente documento regula la inscripción y participación en el evento deportivo Super GP 2026, programado para el día 1 de marzo en Popayán.
            </p>

            <p className="text-white/80 mb-4">
              <strong className="text-white">Al realizar la inscripción, el participante declara que:</strong>
            </p>

            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Participa de manera voluntaria.</li>
              <li>Se encuentra en condiciones físicas y técnicas adecuadas.</li>
              <li>Acepta el reglamento técnico del evento.</li>
              <li>Autoriza el uso de su imagen para fines promocionales.</li>
              <li>Entiende que la inscripción solo queda confirmada tras validar el pago.</li>
              <li>Acepta íntegramente estos términos.</li>
            </ul>

            <p className="text-white/70 mt-4 text-sm">
              El organizador podrá modificar fecha o logística por razones de fuerza mayor.
            </p>
          </section>

          {/* Section 2: Cancellation Policy */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h2 className="font-heading text-2xl font-bold uppercase text-warning">
                Política de Cancelación y Devoluciones
              </h2>
            </div>

            <ul className="text-white/80 space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>Se aceptan solicitudes de devolución <strong className="text-white">únicamente hasta el viernes 27 de febrero</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span><strong className="text-primary">Después del viernes 27 de febrero no se realizarán devoluciones bajo ninguna circunstancia.</strong></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>Las solicitudes deben enviarse por escrito al correo <strong>coronaclubxtreme@gmail.com</strong>.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>No hay devoluciones por inasistencia.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>No se permiten cambios de categoría después del cierre de inscripciones.</span>
              </li>
            </ul>

            <div className="bg-warning/10 border border-warning/30 p-4 mt-4">
              <p className="text-white/80">
                Si el evento es cancelado por el organizador, el participante podrá optar por:
              </p>
              <ul className="list-disc list-inside text-white/70 mt-2 ml-4">
                <li>Reprogramación, o</li>
                <li>Devolución del valor pagado descontando comisiones financieras si aplican.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Risk Declaration */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl font-bold uppercase text-primary">
                Declaración de Asunción de Riesgo y Exoneración de Responsabilidad
              </h2>
            </div>

            <div className="bg-primary/10 border border-primary/30 p-4 mb-4">
              <p className="text-white/90 font-semibold">
                El participante reconoce que el motociclismo y las competencias deportivas de velocidad constituyen actividades de alto riesgo que pueden ocasionar lesiones graves, incapacidad permanente o muerte.
              </p>
            </div>

            <p className="text-white/80 mb-4">En consecuencia:</p>

            <ul className="text-white/80 space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Asume voluntariamente todos los riesgos inherentes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Declara tener la experiencia necesaria para competir.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Declara que su motocicleta se encuentra en condiciones mecánicas adecuadas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Libera y exonera de responsabilidad civil, contractual y extracontractual al organizador, directivos, empleados, patrocinadores y aliados estratégicos por cualquier daño derivado de su participación, salvo dolo comprobado.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Acepta que la organización puede suspender su participación si detecta riesgo evidente.</span>
              </li>
            </ul>

            <p className="text-warning font-bold mt-4">
              Esta cláusula tiene efectos legales vinculantes.
            </p>
          </section>

          {/* Section 4: Data Protection */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-secondary" />
              <h2 className="font-heading text-2xl font-bold uppercase text-secondary">
                Tratamiento de Datos Personales
              </h2>
            </div>

            <p className="text-white/80 mb-4">
              Los datos personales serán tratados conforme a la <strong className="text-white">Ley 1581 de 2012</strong>, con fines de gestión del evento, comunicación y actividades relacionadas.
            </p>

            <p className="text-white/80">
              El participante podrá ejercer sus derechos mediante solicitud escrita al correo <strong className="text-secondary">coronaclubxtreme@gmail.com</strong>.
            </p>
          </section>

          {/* Footer Info */}
          <div className="border-t border-white/10 pt-6 text-center text-white/50 text-sm">
            <p>Última actualización: Febrero 2026</p>
            <p className="mt-2">Super GP Corona Club XP - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};
