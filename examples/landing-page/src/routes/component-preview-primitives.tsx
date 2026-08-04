import { useCallback, useState, type MouseEvent } from "react";
import {
  Alert,
  Alignment,
  Button,
  Card,
  Icon,
  InputGroup,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  NavbarGroup,
  NonIdealState,
  Popover,
  showContextMenu,
  Tag,
} from "@kantzen-ui/ui";
import { LabelledSample } from "./component-preview-shared";
import type {
  ComponentDemoProps,
  ComponentDemoRegistry,
} from "./component-preview-types";

function ButtonDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <div className="wiki-preview-row wiki-preview-row--buttons">
      <LabelledSample label="Primary">
        <Button
          large
          intent="primary"
          text="Button"
          onClick={() => onFeedback("Primary action pressed")}
        />
      </LabelledSample>
      <LabelledSample label="Secondary">
        <Button
          large
          outlined
          text="Button"
          onClick={() => onFeedback("Secondary action pressed")}
        />
      </LabelledSample>
      <LabelledSample label="Minimal">
        <Button
          large
          minimal
          text="Button"
          onClick={() => onFeedback("Minimal action pressed")}
        />
      </LabelledSample>
      <LabelledSample label="Danger">
        <Button
          large
          intent="danger"
          text="Button"
          onClick={() => onFeedback("Danger action pressed")}
        />
      </LabelledSample>
      <LabelledSample label="Disabled">
        <Button disabled large text="Button" />
      </LabelledSample>
    </div>
  );
}

function CardDemo({ onFeedback }: ComponentDemoProps) {
  const [activeCard, setActiveCard] = useState("selected");
  const selectCard = (card: string) => {
    setActiveCard(card);
    onFeedback(`${card[0]!.toUpperCase()}${card.slice(1)} card selected`);
  };
  return (
    <div className="wiki-preview-row">
      <Card
        interactive
        onClick={() => selectCard("default")}
        selected={activeCard === "default"}
      >
        <strong>Default card</strong>
        <p>Related content, without unnecessary decoration.</p>
      </Card>
      <Card
        elevation={2}
        interactive
        onClick={() => selectCard("interactive")}
        selected={activeCard === "interactive"}
      >
        <strong>Interactive card</strong>
        <p>Hover to see the active surface treatment.</p>
      </Card>
      <Card
        interactive
        onClick={() => selectCard("selected")}
        selected={activeCard === "selected"}
      >
        <strong>Selected card</strong>
        <p>A clear current-state treatment.</p>
      </Card>
    </div>
  );
}

function InputGroupDemo({ onFeedback }: ComponentDemoProps) {
  const [inputValue, setInputValue] = useState("");
  return (
    <div className="wiki-preview-stack wiki-preview-narrow">
      <InputGroup
        fill
        leftIcon="search"
        onChange={(event) => {
          setInputValue(event.target.value);
          onFeedback(
            event.target.value
              ? `Searching for “${event.target.value}”`
              : "Search cleared",
          );
        }}
        placeholder="Search projects…"
        value={inputValue}
      />
      <InputGroup
        fill
        leftIcon="link"
        placeholder="Paste a URL"
        rightElement={
          <Button
            aria-label="Submit URL"
            minimal
            icon="arrow-right"
            onClick={() => onFeedback("URL submitted")}
          />
        }
      />
      <InputGroup disabled fill placeholder="Disabled input" />
    </div>
  );
}

function AlertDemo({ onFeedback }: ComponentDemoProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  return (
    <>
      <Button
        intent="danger"
        icon="trash"
        text="Delete project"
        onClick={() => setAlertOpen(true)}
      />
      <Alert
        canEscapeKeyCancel
        canOutsideClickCancel
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon="trash"
        intent="danger"
        isOpen={alertOpen}
        onClose={(confirmed) => {
          setAlertOpen(false);
          onFeedback(confirmed ? "Project deleted" : "Deletion cancelled");
        }}
      >
        <h3>Delete project?</h3>
        <p>This action cannot be undone.</p>
      </Alert>
    </>
  );
}

function MenuDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <Menu className="wiki-demo-menu">
      <MenuDivider title="Project" />
      <MenuItem
        icon="document-open"
        text="Open"
        labelElement="⌘O"
        onClick={() => onFeedback("Project opened")}
      />
      <MenuItem
        icon="duplicate"
        text="Duplicate"
        onClick={() => onFeedback("Project duplicated")}
      />
      <MenuItem
        icon="share"
        text="Share"
        onClick={() => onFeedback("Share action selected")}
      />
      <MenuDivider />
      <MenuItem
        icon="trash"
        intent="danger"
        text="Delete"
        onClick={() => onFeedback("Delete action selected")}
      />
    </Menu>
  );
}

function PopoverDemo({ onFeedback }: ComponentDemoProps) {
  return (
    <Popover
      content={
        <div className="wiki-popover-content">
          <strong>Deployment ready</strong>
          <p>All checks passed in production.</p>
          <Button
            fill
            intent="primary"
            text="Deploy"
            onClick={() => onFeedback("Deployment started")}
          />
        </div>
      }
    >
      <Button rightIcon="caret-down" text="Open popover" />
    </Popover>
  );
}

function ContextMenuDemo({ onFeedback }: ComponentDemoProps) {
  const openContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      showContextMenu({
        content: (
          <Menu>
            <MenuItem
              icon="duplicate"
              text="Duplicate"
              onClick={() => onFeedback("Surface duplicated")}
            />
            <MenuItem
              icon="edit"
              text="Rename"
              onClick={() => onFeedback("Rename action selected")}
            />
            <MenuDivider />
            <MenuItem
              icon="trash"
              intent="danger"
              text="Delete"
              onClick={() => onFeedback("Delete action selected")}
            />
          </Menu>
        ),
        targetOffset: { left: event.clientX, top: event.clientY },
      });
    },
    [onFeedback],
  );
  return (
    <button
      className="wiki-context-target"
      type="button"
      onClick={openContextMenu}
      onContextMenu={openContextMenu}
    >
      <Icon icon="select" size={22} />
      <strong>Right-click this surface</strong>
      <span>or click to open the context menu</span>
    </button>
  );
}

function NavbarDemo({ onFeedback }: ComponentDemoProps) {
  const [sitePath, setSitePath] = useState("/projects");
  const [createdProjects, setCreatedProjects] = useState(0);
  const navigate = (path: string) => {
    setSitePath(path);
    onFeedback(`${path.slice(1)} view selected`);
  };
  return (
    <Navbar className="wiki-demo-navbar">
      <NavbarGroup>
        <strong>KANTZEN</strong>
        <Button
          active={sitePath === "/projects"}
          minimal
          text="Projects"
          onClick={() => navigate("/projects")}
        />
        <Button
          active={sitePath === "/activity"}
          minimal
          text="Activity"
          onClick={() => navigate("/activity")}
        />
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        <Button
          aria-label="Search"
          minimal
          icon="search"
          onClick={() => onFeedback("Search opened")}
        />
        <Button
          intent="primary"
          text={`New project${createdProjects ? ` · ${createdProjects}` : ""}`}
          onClick={() => {
            setCreatedProjects((count) => count + 1);
            onFeedback("New project created");
          }}
        />
      </NavbarGroup>
    </Navbar>
  );
}

function TagDemo() {
  return (
    <div className="wiki-preview-row">
      <Tag>Default</Tag>
      <Tag minimal>Minimal</Tag>
      <Tag className="wiki-tag-success">Ready</Tag>
    </div>
  );
}

function NonIdealStateDemo({ onFeedback }: ComponentDemoProps) {
  const [created, setCreated] = useState(false);
  return created ? (
    <div className="wiki-created-state">
      <Icon icon="folder-open" size={30} />
      <strong>Project created</strong>
      <span>Your empty state resolved successfully.</span>
    </div>
  ) : (
    <NonIdealState
      action={
        <Button
          intent="primary"
          text="Create project"
          onClick={() => {
            setCreated(true);
            onFeedback("Project created");
          }}
        />
      }
      description="Create a project to start organizing your work."
      icon="folder-new"
      title="No projects yet"
    />
  );
}

export const primitiveComponentDemos = {
  Alert: AlertDemo,
  Button: ButtonDemo,
  Card: CardDemo,
  InputGroup: InputGroupDemo,
  Menu: MenuDemo,
  Navbar: NavbarDemo,
  NonIdealState: NonIdealStateDemo,
  Popover: PopoverDemo,
  showContextMenu: ContextMenuDemo,
  Tag: TagDemo,
} satisfies ComponentDemoRegistry;
