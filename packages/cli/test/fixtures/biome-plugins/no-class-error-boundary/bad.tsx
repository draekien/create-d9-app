// @ts-nocheck
export class Boundary extends Component {
  componentDidCatch(error) {
    report(error)
  }
}

export class Derived extends Component {
  static getDerivedStateFromError() {
    return { failed: true }
  }
}
