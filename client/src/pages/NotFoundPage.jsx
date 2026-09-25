import { Button } from '../components/ui/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <main className="not-found" id="main">
      <div className="container container--narrow">
        <p className="eyebrow">Error 404</p>
        <h1 className="not-found__title">That page does not exist</h1>
        <p className="not-found__body">
          The address you followed is not part of this site. The portfolio itself is one page.
        </p>
        <div className="not-found__actions">
          <Button
            variant="primary"
            to="/"
            icon={<Icon name="arrowRight" size={16} />}
            iconPosition="end"
          >
            Back to the portfolio
          </Button>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;
