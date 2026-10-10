// @ts-nocheck
export class Plain extends Component {
  getDerivedStateFromError() {
    return null
  }

  render() {
    return <ErrorBoundary fallback={null}>{this.props.children}</ErrorBoundary>
  }
}
