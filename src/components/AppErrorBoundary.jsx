import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boot-fallback">
          <article>
            <strong>EnergyOS não conseguiu renderizar a interface.</strong>
            <p>Copie esta mensagem de erro para corrigirmos o ponto exato:</p>
            <code>{this.state.error.message}</code>
          </article>
        </div>
      );
    }

    return this.props.children;
  }
}
