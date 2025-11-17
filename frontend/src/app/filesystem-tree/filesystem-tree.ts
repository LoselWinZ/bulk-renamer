import {Component, OnInit, signal} from '@angular/core';
import {
  Tree,
  TreeNodeCollapseEvent,
  TreeNodeExpandEvent,
  TreeNodeSelectEvent,
  TreeNodeUnSelectEvent, UITreeNode
} from 'primeng/tree';
import {main} from '../../../wailsjs/go/models';
import Item = main.Item;
import {TreeNode} from 'primeng/api';
import {ListDirectory, LoadRoot, UpdateWorkingDirectory} from '../../../wailsjs/go/main/App';
import {node} from '@primeuix/themes/aura/tree';
import WorkingDirectoryEvent = main.WorkingDirectoryEvent;

@Component({
  selector: 'app-filesystem-tree',
  imports: [
    Tree
  ],
  templateUrl: './filesystem-tree.html',
  styleUrl: './filesystem-tree.scss',
})
export class FilesystemTree implements OnInit {
  protected selectedNode!: TreeNode
  items = signal<TreeNode[]>([]);

  ngOnInit() {
    LoadRoot().then((items: Item[]) => {
      this.items.set(items.map(item => this.itemToNode(item, undefined)));
    })
  }

  private itemToNode(item: main.Item, node: TreeNode | undefined): TreeNode {
    let newNode = ({
      label: item.name,
      icon: 'pi pi-folder',
      expandedIcon: 'pi pi-folder-open',
      parent: node,
      leaf: item.items == undefined || item.items.length == 0,
      data: item,
      nodeToggleButton: 'pi pi-caret-left'
    }) as TreeNode;

    newNode.children = item.items?.map(child => this.itemToNode(child, newNode));
    return newNode;
  }

  protected nodeExpand(event: TreeNodeExpandEvent) {
    let node = event.node;
    ListDirectory(node.data.path!, false, true).then(children => {
      node.children = children.map(value1 => this.itemToNode(value1, node))
      this.items.update(current => [...current]);
    })
  }

  protected nodeCollapse(event: TreeNodeCollapseEvent) {

  }

  protected nodeSelect(event: TreeNodeSelectEvent) {
    UpdateWorkingDirectory(new WorkingDirectoryEvent({path: event.node.data.path, segments: []})).then();
  }

  protected nodeUnselect(event: TreeNodeUnSelectEvent) {
    this.selectedNode = event.node;
  }
}
